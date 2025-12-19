import { NextRequest, NextResponse } from 'next/server';

// x402 Payment Configuration
const X402_CONFIG = {
    network: 'movement-testnet',
    payTo: process.env.MOVEMENT_PAY_TO || '0x0000000000000000000000000000000000000000',
    facilitatorUrl: 'https://x402.org/facilitator',
};

// Mock service data (will be replaced with database)
const services: Record<string, { name: string; price: number; description: string }> = {
    'svc-001': { name: 'GPT-4 Text Generation', price: 0.01, description: 'AI text generation' },
    'svc-002': { name: 'Image Generation (SDXL)', price: 0.05, description: 'AI image generation' },
    'svc-003': { name: 'Real-time Translation', price: 0.002, description: 'Multi-language translation' },
};

/**
 * GET /api/services/[serviceId]
 * Returns service info or 402 Payment Required if payment needed
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serviceId: string }> }
) {
    const { serviceId } = await params;

    // Check if service exists
    const service = services[serviceId];
    if (!service) {
        return NextResponse.json(
            { error: 'Service not found' },
            { status: 404 }
        );
    }

    // Check for x402 payment header
    const paymentHeader = request.headers.get('X-PAYMENT') || request.headers.get('PAYMENT-SIGNATURE');

    if (!paymentHeader) {
        // Return 402 Payment Required with payment requirements
        const paymentRequirements = {
            scheme: 'exact',
            network: X402_CONFIG.network,
            maxAmountRequired: (service.price * 1e8).toString(), // Convert to smallest unit
            resource: `/api/services/${serviceId}`,
            description: service.description,
            mimeType: 'application/json',
            payTo: X402_CONFIG.payTo,
            maxTimeoutSeconds: 300,
            asset: 'MOVE',
            extra: {
                name: service.name,
                serviceId: serviceId,
            },
        };

        // Encode as base64 for header
        const paymentRequiredB64 = Buffer.from(JSON.stringify([paymentRequirements])).toString('base64');

        return new NextResponse(
            JSON.stringify({
                error: 'Payment Required',
                message: `This service costs ${service.price} MOVE per request`,
                service: {
                    id: serviceId,
                    name: service.name,
                    price: service.price,
                },
            }),
            {
                status: 402,
                headers: {
                    'Content-Type': 'application/json',
                    'PAYMENT-REQUIRED': paymentRequiredB64,
                    'X-Price': service.price.toString(),
                    'X-Asset': 'MOVE',
                    'X-Network': X402_CONFIG.network,
                },
            }
        );
    }

    // If payment header exists, verify and process
    try {
        // Decode payment payload
        const paymentPayload = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf-8'));

        // In production, verify with facilitator
        // const verifyResponse = await fetch(`${X402_CONFIG.facilitatorUrl}/verify`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ payload: paymentPayload, requirements: paymentRequirements }),
        // });

        // For demo, we'll simulate verification
        const isValid = paymentPayload && paymentPayload.signature;

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 402 }
            );
        }

        // Execute the service and return result
        const result = await executeService(serviceId, paymentPayload.input || {});

        // Return success response with payment receipt
        return NextResponse.json({
            success: true,
            result,
            payment: {
                amount: service.price,
                asset: 'MOVE',
                txHash: paymentPayload.txHash || 'pending',
            },
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json(
            { error: 'Payment processing failed' },
            { status: 400 }
        );
    }
}

/**
 * POST /api/services/[serviceId]
 * Execute service with x402 payment
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ serviceId: string }> }
) {
    const { serviceId } = await params;

    const service = services[serviceId];
    if (!service) {
        return NextResponse.json(
            { error: 'Service not found' },
            { status: 404 }
        );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Check for payment
    const paymentHeader = request.headers.get('X-PAYMENT') || request.headers.get('PAYMENT-SIGNATURE');

    if (!paymentHeader) {
        // Return 402 with payment requirements
        const paymentRequirements = {
            scheme: 'exact',
            network: X402_CONFIG.network,
            maxAmountRequired: (service.price * 1e8).toString(),
            resource: `/api/services/${serviceId}`,
            description: service.description,
            payTo: X402_CONFIG.payTo,
            maxTimeoutSeconds: 300,
            asset: 'MOVE',
        };

        const paymentRequiredB64 = Buffer.from(JSON.stringify([paymentRequirements])).toString('base64');

        return new NextResponse(
            JSON.stringify({
                error: 'Payment Required',
                message: `This service costs ${service.price} MOVE per request`,
                paymentDetails: {
                    price: service.price,
                    asset: 'MOVE',
                    payTo: X402_CONFIG.payTo,
                },
            }),
            {
                status: 402,
                headers: {
                    'Content-Type': 'application/json',
                    'PAYMENT-REQUIRED': paymentRequiredB64,
                },
            }
        );
    }

    // Process payment and execute service
    try {
        const result = await executeService(serviceId, body.input || {});

        return NextResponse.json({
            success: true,
            result,
            payment: {
                amount: service.price,
                asset: 'MOVE',
                status: 'completed',
            },
        });
    } catch (error) {
        console.error('Service execution error:', error);
        return NextResponse.json(
            { error: 'Service execution failed' },
            { status: 500 }
        );
    }
}

// Mock service execution
async function executeService(serviceId: string, input: Record<string, unknown>): Promise<unknown> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    switch (serviceId) {
        case 'svc-001':
            return {
                type: 'text',
                content: `Generated text for prompt: "${input.prompt || 'default'}"`,
                tokens: 150,
                model: 'gpt-4',
            };
        case 'svc-002':
            return {
                type: 'image',
                url: 'https://placeholder.co/512x512?text=Generated+Image',
                dimensions: { width: 512, height: 512 },
                model: 'sdxl',
            };
        case 'svc-003':
            return {
                type: 'translation',
                original: input.text || 'Hello',
                translated: 'Hola',
                sourceLang: 'en',
                targetLang: input.targetLang || 'es',
            };
        default:
            return { message: 'Service executed successfully' };
    }
}
