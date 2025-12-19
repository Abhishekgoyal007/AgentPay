'use client';

import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';

interface ServiceResult {
    success: boolean;
    result?: unknown;
    error?: string;
    txHash?: string;
    processingTime?: number;
}

// Mock AI services that actually return results
const executeServiceLogic = async (
    serviceId: string,
    input: Record<string, unknown>
): Promise<unknown> => {
    // Add realistic delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    switch (serviceId) {
        case 'svc-001': // GPT-4 Text Generation
            const prompt = input.prompt as string || 'Hello';
            return {
                text: generateMockText(prompt),
                tokens_used: Math.floor(Math.random() * 200) + 50,
                model: 'gpt-4',
                finish_reason: 'stop',
            };

        case 'svc-002': // Image Generation
            return {
                url: `https://picsum.photos/seed/${Date.now()}/512/512`,
                width: 512,
                height: 512,
                seed: Math.floor(Math.random() * 100000),
                model: 'sdxl-1.0',
            };

        case 'svc-003': // Translation
            const text = input.text as string || 'Hello';
            const targetLang = input.target_lang as string || 'es';
            return {
                translated: translateMock(text, targetLang),
                source_lang: 'en',
                target_lang: targetLang,
                confidence: 0.95 + Math.random() * 0.05,
            };

        case 'svc-004': // Code Review
            return {
                issues: [
                    { severity: 'warning', line: 5, message: 'Consider using const instead of let' },
                    { severity: 'info', line: 12, message: 'Function could be simplified' },
                ],
                score: 85 + Math.floor(Math.random() * 15),
                suggestions: ['Add type annotations', 'Consider error handling'],
            };

        case 'svc-005': // Data Extraction
            return {
                data: {
                    title: 'Extracted Title',
                    description: 'Extracted description from the document',
                    entities: ['Entity 1', 'Entity 2', 'Entity 3'],
                },
                confidence: 0.92,
                processingTime: '1.2s',
            };

        case 'svc-006': // Audio Transcription
            return {
                transcript: 'This is a sample transcription of the audio content.',
                duration: 45.5,
                language: 'en',
                confidence: 0.94,
                segments: [
                    { start: 0, end: 10, text: 'This is a sample' },
                    { start: 10, end: 20, text: 'transcription of the audio content.' },
                ],
            };

        default:
            return { message: 'Service executed successfully', timestamp: new Date().toISOString() };
    }
};

// Mock text generation
const generateMockText = (prompt: string): string => {
    const templates = [
        `Based on your prompt "${prompt.slice(0, 50)}...", here's the generated content:\n\nThe future of AI-powered services is here. With AgentPay, autonomous agents can transact seamlessly, paying for services in real-time using the x402 protocol. This revolutionary approach eliminates traditional payment friction and enables true machine-to-machine commerce.`,
        `Regarding "${prompt.slice(0, 50)}...":\n\nAs we enter the era of agentic AI, the need for native payment infrastructure becomes critical. Movement Network provides the perfect foundation with its high-speed, low-cost transactions, enabling micropayments that were previously impossible.`,
        `Here's my analysis of "${prompt.slice(0, 50)}...":\n\nThe intersection of AI and blockchain technology opens unprecedented opportunities. AgentPay stands at this crossroads, providing the payment rails that enable autonomous agents to operate independently in the digital economy.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
};

// Mock translation
const translateMock = (text: string, targetLang: string): string => {
    const translations: Record<string, Record<string, string>> = {
        'Hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは' },
        'How are you?': { es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es dir?', ja: 'お元気ですか？' },
    };

    if (translations[text] && translations[text][targetLang]) {
        return translations[text][targetLang];
    }

    // Generic mock translation
    return `[${targetLang.toUpperCase()}] ${text}`;
};

export function useX402Service() {
    const { makePayment, isConnected, balance } = useWallet();
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState<ServiceResult | null>(null);

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
            return { success: false, error: `Insufficient balance. Need ${price} MOVE, have ${balance.toFixed(4)} MOVE` };
        }

        setIsProcessing(true);
        const startTime = Date.now();

        try {
            // Step 1: Make payment via x402
            const paymentResult = await makePayment(price, serviceName, providerAddress);

            if (!paymentResult.success) {
                setIsProcessing(false);
                return { success: false, error: paymentResult.error };
            }

            // Step 2: Execute the service
            const result = await executeServiceLogic(serviceId, input);

            const processingTime = Date.now() - startTime;

            const serviceResult: ServiceResult = {
                success: true,
                result,
                txHash: paymentResult.txHash,
                processingTime,
            };

            setLastResult(serviceResult);
            setIsProcessing(false);
            return serviceResult;

        } catch (error) {
            setIsProcessing(false);
            const errorMessage = error instanceof Error ? error.message : 'Service execution failed';
            return { success: false, error: errorMessage };
        }
    }, [isConnected, balance, makePayment]);

    return {
        executeService,
        isProcessing,
        lastResult,
        isConnected,
        balance,
    };
}
