// x402 Protocol Configuration for Movement Network
// Using CAIP-2 format for network identification

// Movement Bardock Testnet Configuration
export const MOVEMENT_NETWORK = {
    // CAIP-2 format: eip155:<chainId>
    caip2: 'eip155:30732',
    chainId: 30732,
    name: 'Movement Bardock Testnet',
    rpcUrl: 'https://mevm.devnet.imola.movementlabs.xyz',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
    nativeToken: {
        symbol: 'MOVE',
        name: 'Movement Token',
        decimals: 8,
    },
} as const;

// x402 Payment Scheme Configuration
export const X402_CONFIG = {
    // Scheme: 'exact' for direct payment amount matching
    scheme: 'exact' as const,

    // Network identifier in CAIP-2 format
    network: MOVEMENT_NETWORK.caip2,

    // Asset configuration
    asset: {
        symbol: 'MOVE',
        decimals: MOVEMENT_NETWORK.nativeToken.decimals,
    },

    // Default timeout for payments (5 minutes)
    maxTimeoutSeconds: 300,

    // Since Movement isn't in the default facilitator, we use local verification
    // For production, you'd run a self-hosted facilitator
    facilitatorMode: 'local' as const,
} as const;

// Payment requirement interface (per x402 spec)
export interface PaymentRequirement {
    scheme: 'exact';
    network: string;
    maxAmountRequired: string; // In smallest unit (wei equivalent)
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: Record<string, unknown>;
}

// Payment payload interface (what client sends back)
export interface PaymentPayload {
    signature: string;
    txHash: string;
    from: string;
    to: string;
    amount: string;
    network: string;
    timestamp: number;
    nonce?: string;
}

// Create payment requirements for a service
export function createPaymentRequirements(
    serviceId: string,
    serviceName: string,
    priceInMove: number,
    payToAddress: string,
    resource: string
): PaymentRequirement {
    // Convert MOVE to smallest unit (8 decimals)
    const amountInSmallestUnit = Math.floor(priceInMove * 10 ** 8).toString();

    return {
        scheme: X402_CONFIG.scheme,
        network: X402_CONFIG.network,
        maxAmountRequired: amountInSmallestUnit,
        resource,
        description: `Payment for ${serviceName}`,
        mimeType: 'application/json',
        payTo: payToAddress,
        maxTimeoutSeconds: X402_CONFIG.maxTimeoutSeconds,
        asset: X402_CONFIG.asset.symbol,
        extra: {
            serviceId,
            serviceName,
            priceDisplay: `${priceInMove} MOVE`,
        },
    };
}

// Encode payment requirements to base64 (for PAYMENT-REQUIRED header)
export function encodePaymentRequirements(requirements: PaymentRequirement[]): string {
    return Buffer.from(JSON.stringify(requirements)).toString('base64');
}

// Decode payment payload from base64 (from PAYMENT-SIGNATURE header)
export function decodePaymentPayload(encoded: string): PaymentPayload | null {
    try {
        return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
    } catch {
        return null;
    }
}

// Verify payment signature (local verification for Movement)
export async function verifyPaymentLocal(
    payload: PaymentPayload,
    requirement: PaymentRequirement
): Promise<{ valid: boolean; reason?: string }> {
    // Basic validation
    if (!payload.signature || !payload.txHash) {
        return { valid: false, reason: 'Missing signature or transaction hash' };
    }

    if (payload.network !== requirement.network) {
        return { valid: false, reason: 'Network mismatch' };
    }

    if (payload.to.toLowerCase() !== requirement.payTo.toLowerCase()) {
        return { valid: false, reason: 'Payment recipient mismatch' };
    }

    // Check amount (with small tolerance for gas estimation differences)
    const paidAmount = BigInt(payload.amount);
    const requiredAmount = BigInt(requirement.maxAmountRequired);
    if (paidAmount < requiredAmount) {
        return { valid: false, reason: 'Insufficient payment amount' };
    }

    // Check timestamp (must be within timeout window)
    const now = Math.floor(Date.now() / 1000);
    if (now - payload.timestamp > requirement.maxTimeoutSeconds) {
        return { valid: false, reason: 'Payment expired' };
    }

    // In a real implementation, you would:
    // 1. Verify the signature using the from address
    // 2. Check the transaction on-chain
    // 3. Confirm the transaction is finalized

    return { valid: true };
}

// Generate x402 402 Payment Required response headers
export function create402Headers(requirements: PaymentRequirement[]): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'PAYMENT-REQUIRED': encodePaymentRequirements(requirements),
        'X-Price': requirements[0]?.extra?.priceDisplay as string || '',
        'X-Asset': X402_CONFIG.asset.symbol,
        'X-Network': X402_CONFIG.network,
        'X-Scheme': X402_CONFIG.scheme,
    };
}
