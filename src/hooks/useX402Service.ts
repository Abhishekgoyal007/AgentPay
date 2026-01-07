'use client';

import { useState, useCallback } from 'react';
import { useRealWallet } from './useRealWallet';
import { X402_CONFIG, MOVEMENT_NETWORK } from '@/lib/x402-config';

export interface ServiceResult {
    success: boolean;
    result?: unknown;
    error?: string;
    txHash?: string;
    processingTime?: number;
    x402?: {
        paymentVerified: boolean;
        network: string;
        amount: number;
        asset: string;
    };
}

export interface X402PaymentDetails {
    required: boolean;
    price: number;
    asset: string;
    network: string;
    payTo: string;
}

/**
 * useX402Service - Hook for executing services via x402 payment protocol
 * 
 * This hook implements the client-side x402 flow:
 * 1. Request service → receive 402 with payment requirements
 * 2. Execute payment via wallet
 * 3. Retry request with PAYMENT-SIGNATURE header
 * 4. Receive service result
 */
export function useX402Service() {
    const {
        makeX402Payment,
        isConnected,
        balance,
        address,
        isProcessingPayment,
    } = useRealWallet();

    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState<ServiceResult | null>(null);
    const [paymentStep, setPaymentStep] = useState<'idle' | 'requesting' | 'paying' | 'executing'>('idle');

    /**
     * Execute a service following x402 protocol
     */
    const executeService = useCallback(async (
        serviceId: string,
        serviceName: string,
        price: number,
        providerAddress: string,
        input: Record<string, unknown>
    ): Promise<ServiceResult> => {
        if (!isConnected) {
            return { success: false, error: 'Wallet not connected' };
        }

        if (balance < price) {
            return {
                success: false,
                error: `Insufficient balance. Need ${price} MOVE, have ${balance.toFixed(4)} MOVE`
            };
        }

        setIsProcessing(true);
        const startTime = Date.now();

        try {
            // Step 1: Initial request (will return 402)
            setPaymentStep('requesting');
            console.log(`[x402] Requesting service: ${serviceName}`);

            const initialResponse = await fetch(`/api/services/${serviceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input }),
            });

            // We expect a 402 response
            if (initialResponse.status === 402) {
                console.log('[x402] Received 402 Payment Required');

                // Extract payment requirements from response
                const paymentRequired = await initialResponse.json();
                console.log('[x402] Payment requirements:', paymentRequired);

                // Step 2: Execute payment
                setPaymentStep('paying');
                console.log('[x402] Executing payment...');

                const paymentResult = await makeX402Payment(
                    price,
                    providerAddress,
                    serviceId,
                    serviceName
                );

                if (!paymentResult.success) {
                    setIsProcessing(false);
                    setPaymentStep('idle');
                    return { success: false, error: paymentResult.error };
                }

                console.log('[x402] Payment successful:', paymentResult.txHash);

                // Step 3: Retry with payment signature
                setPaymentStep('executing');
                console.log('[x402] Retrying with payment signature...');

                const paidResponse = await fetch(`/api/services/${serviceId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'PAYMENT-SIGNATURE': paymentResult.paymentPayload || '',
                    },
                    body: JSON.stringify({ input }),
                });

                if (!paidResponse.ok) {
                    const errorData = await paidResponse.json().catch(() => ({}));
                    setIsProcessing(false);
                    setPaymentStep('idle');
                    return {
                        success: false,
                        error: errorData.error || 'Service execution failed after payment',
                        txHash: paymentResult.txHash,
                    };
                }

                // Success!
                const result = await paidResponse.json();
                const processingTime = Date.now() - startTime;

                console.log('[x402] Service executed successfully');

                const serviceResult: ServiceResult = {
                    success: true,
                    result: result.result,
                    txHash: paymentResult.txHash,
                    processingTime,
                    x402: {
                        paymentVerified: result.payment?.verified || true,
                        network: X402_CONFIG.network,
                        amount: price,
                        asset: X402_CONFIG.asset.symbol,
                    },
                };

                setLastResult(serviceResult);
                setIsProcessing(false);
                setPaymentStep('idle');
                return serviceResult;
            }

            // If we got a 200 directly (shouldn't happen without payment header)
            const result = await initialResponse.json();
            const processingTime = Date.now() - startTime;

            const serviceResult: ServiceResult = {
                success: true,
                result,
                processingTime,
            };

            setLastResult(serviceResult);
            setIsProcessing(false);
            setPaymentStep('idle');
            return serviceResult;

        } catch (error) {
            setIsProcessing(false);
            setPaymentStep('idle');
            const errorMessage = error instanceof Error ? error.message : 'Service execution failed';
            console.error('[x402] Error:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [isConnected, balance, makeX402Payment]);

    /**
     * Get payment requirements for a service without executing
     */
    const getPaymentRequirements = useCallback(async (
        serviceId: string
    ): Promise<X402PaymentDetails | null> => {
        try {
            const response = await fetch(`/api/services/${serviceId}`);

            if (response.status === 402) {
                const data = await response.json();
                return {
                    required: true,
                    price: data.service?.price || 0,
                    asset: data.x402?.asset || 'MOVE',
                    network: data.x402?.network || X402_CONFIG.network,
                    payTo: data.service?.providerAddress || '',
                };
            }

            return null;
        } catch (error) {
            console.error('[x402] Error getting payment requirements:', error);
            return null;
        }
    }, []);

    return {
        executeService,
        getPaymentRequirements,
        isProcessing: isProcessing || isProcessingPayment,
        paymentStep,
        lastResult,
        isConnected,
        balance,
        walletAddress: address,
        network: MOVEMENT_NETWORK,
        x402Config: X402_CONFIG,
    };
}
