import { NextRequest, NextResponse } from 'next/server';
import {
    X402_CONFIG,
    createPaymentRequirements,
    decodePaymentPayload,
    verifyPaymentLocal,
    create402Headers,
} from '@/lib/x402-config';

// Default service provider address (would come from database in production)
const DEFAULT_PROVIDER_ADDRESS = process.env.MOVEMENT_PAY_TO || '0x742d35Cc6634C0532925a3b844Bc9e7595f00000';

// Service registry (would be database in production)
const services: Record<string, {
    name: string;
    price: number;
    description: string;
    providerAddress: string;
    category: string;
}> = {
    'svc-001': {
        name: 'GPT-4 Text Generation',
        price: 0.01,
        description: 'AI-powered text generation using GPT-4',
        providerAddress: DEFAULT_PROVIDER_ADDRESS,
        category: 'AI',
    },
    'svc-002': {
        name: 'Image Generation (SDXL)',
        price: 0.05,
        description: 'Create stunning images with Stable Diffusion XL',
        providerAddress: DEFAULT_PROVIDER_ADDRESS,
        category: 'AI',
    },
    'svc-003': {
        name: 'Real-time Translation',
        price: 0.002,
        description: 'Instant multi-language translation',
        providerAddress: DEFAULT_PROVIDER_ADDRESS,
        category: 'AI',
    },
    'svc-004': {
        name: 'Code Review',
        price: 0.02,
        description: 'AI-powered code analysis and suggestions',
        providerAddress: DEFAULT_PROVIDER_ADDRESS,
        category: 'Developer Tools',
    },
    'svc-005': {
        name: 'Data Extraction',
        price: 0.015,
        description: 'Extract structured data from documents',
        providerAddress: DEFAULT_PROVIDER_ADDRESS,
        category: 'Data',
    },
    'svc-006': {
        name: 'Audio Transcription',
        price: 0.03,
        description: 'Convert audio to text with high accuracy',
        providerAddress: DEFAULT_PROVIDER_ADDRESS,
        category: 'Media',
    },
};

/**
 * GET /api/services/[serviceId]
 * Returns service info or 402 Payment Required if payment needed
 * Implements x402 protocol specification
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ serviceId: string }> }
) {
    const { serviceId } = await params;
    const service = services[serviceId];

    if (!service) {
        return NextResponse.json(
            { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
            { status: 404 }
        );
    }

    // Check for x402 payment header (per spec: PAYMENT-SIGNATURE)
    const paymentHeader = request.headers.get('PAYMENT-SIGNATURE') || request.headers.get('X-PAYMENT');

    if (!paymentHeader) {
        // Return 402 Payment Required with x402 payment requirements
        const requirements = createPaymentRequirements(
            serviceId,
            service.name,
            service.price,
            service.providerAddress,
            `/api/services/${serviceId}`
        );

        const headers = create402Headers([requirements]);

        return new NextResponse(
            JSON.stringify({
                error: 'Payment Required',
                code: 'PAYMENT_REQUIRED',
                message: `This service costs ${service.price} MOVE per request`,
                service: {
                    id: serviceId,
                    name: service.name,
                    price: service.price,
                    priceFormatted: `${service.price} MOVE`,
                    description: service.description,
                    category: service.category,
                },
                x402: {
                    version: '2.0',
                    scheme: X402_CONFIG.scheme,
                    network: X402_CONFIG.network,
                    asset: X402_CONFIG.asset.symbol,
                    instructions: 'Include PAYMENT-SIGNATURE header with base64-encoded payment payload',
                },
            }),
            {
                status: 402,
                headers,
            }
        );
    }

    // Payment header exists - verify and process
    try {
        const payload = decodePaymentPayload(paymentHeader);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid payment payload format', code: 'INVALID_PAYLOAD' },
                { status: 400 }
            );
        }

        // Create requirements for verification
        const requirements = createPaymentRequirements(
            serviceId,
            service.name,
            service.price,
            service.providerAddress,
            `/api/services/${serviceId}`
        );

        // Verify payment locally (since Movement isn't in default facilitator)
        const verification = await verifyPaymentLocal(payload, requirements);

        if (!verification.valid) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Payment verification failed',
                    code: 'PAYMENT_INVALID',
                    reason: verification.reason,
                }),
                {
                    status: 402,
                    headers: create402Headers([requirements]),
                }
            );
        }

        // Payment verified - execute service
        const result = await executeService(serviceId, {});

        // Return success with payment receipt
        const settlementResponse = {
            success: true,
            network: X402_CONFIG.network,
            txHash: payload.txHash,
            amount: service.price,
            asset: X402_CONFIG.asset.symbol,
            settledAt: new Date().toISOString(),
        };

        return NextResponse.json(
            {
                success: true,
                result,
                payment: {
                    verified: true,
                    txHash: payload.txHash,
                    amount: service.price,
                    asset: 'MOVE',
                    network: X402_CONFIG.network,
                },
                x402: {
                    version: '2.0',
                    settlement: settlementResponse,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'PAYMENT-RESPONSE': Buffer.from(JSON.stringify(settlementResponse)).toString('base64'),
                },
            }
        );
    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json(
            { error: 'Payment processing failed', code: 'PROCESSING_ERROR' },
            { status: 500 }
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
            { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
            { status: 404 }
        );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Check for payment header
    const paymentHeader = request.headers.get('PAYMENT-SIGNATURE') || request.headers.get('X-PAYMENT');

    if (!paymentHeader) {
        // Return 402 Payment Required
        const requirements = createPaymentRequirements(
            serviceId,
            service.name,
            service.price,
            service.providerAddress,
            `/api/services/${serviceId}`
        );

        return new NextResponse(
            JSON.stringify({
                error: 'Payment Required',
                code: 'PAYMENT_REQUIRED',
                message: `This service costs ${service.price} MOVE per request`,
                paymentDetails: {
                    price: service.price,
                    asset: 'MOVE',
                    payTo: service.providerAddress,
                    network: X402_CONFIG.network,
                },
                x402: {
                    version: '2.0',
                    instructions: 'Submit payment and include PAYMENT-SIGNATURE header',
                },
            }),
            {
                status: 402,
                headers: create402Headers([requirements]),
            }
        );
    }

    // Verify payment and execute
    try {
        const payload = decodePaymentPayload(paymentHeader);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid payment payload', code: 'INVALID_PAYLOAD' },
                { status: 400 }
            );
        }

        const requirements = createPaymentRequirements(
            serviceId,
            service.name,
            service.price,
            service.providerAddress,
            `/api/services/${serviceId}`
        );

        const verification = await verifyPaymentLocal(payload, requirements);

        if (!verification.valid) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Payment verification failed',
                    code: 'PAYMENT_INVALID',
                    reason: verification.reason,
                }),
                {
                    status: 402,
                    headers: create402Headers([requirements]),
                }
            );
        }

        // Execute service
        const result = await executeService(serviceId, body.input || {});

        const settlementResponse = {
            success: true,
            network: X402_CONFIG.network,
            txHash: payload.txHash,
            amount: service.price,
            asset: X402_CONFIG.asset.symbol,
            settledAt: new Date().toISOString(),
        };

        return NextResponse.json(
            {
                success: true,
                result,
                payment: {
                    verified: true,
                    txHash: payload.txHash,
                    amount: service.price,
                    asset: 'MOVE',
                    status: 'settled',
                },
            },
            {
                headers: {
                    'PAYMENT-RESPONSE': Buffer.from(JSON.stringify(settlementResponse)).toString('base64'),
                },
            }
        );
    } catch (error) {
        console.error('Service execution error:', error);
        return NextResponse.json(
            { error: 'Service execution failed', code: 'EXECUTION_ERROR' },
            { status: 500 }
        );
    }
}

// Mock service execution (in production, these would call real AI APIs)
async function executeService(serviceId: string, input: Record<string, unknown>): Promise<unknown> {
    // Simulate realistic processing time
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    switch (serviceId) {
        case 'svc-001': // GPT-4 Text Generation
            const prompt = (input.prompt as string) || 'Hello, how can AI help you today?';
            return {
                type: 'text_generation',
                executionId,
                content: generateAIResponse(prompt),
                model: 'gpt-4',
                tokens: {
                    prompt: prompt.split(' ').length * 1.3,
                    completion: 150,
                    total: prompt.split(' ').length * 1.3 + 150,
                },
                finishReason: 'stop',
                createdAt: new Date().toISOString(),
            };

        case 'svc-002': // Image Generation
            return {
                type: 'image_generation',
                executionId,
                images: [{
                    url: `https://picsum.photos/seed/${Date.now()}/512/512`,
                    width: 512,
                    height: 512,
                }],
                model: 'sdxl-1.0',
                seed: Math.floor(Math.random() * 100000),
                createdAt: new Date().toISOString(),
            };

        case 'svc-003': // Translation
            const text = (input.text as string) || 'Hello';
            const targetLang = (input.targetLang as string) || 'es';
            return {
                type: 'translation',
                executionId,
                original: text,
                translated: translateText(text, targetLang),
                sourceLang: 'en',
                targetLang,
                confidence: 0.95 + Math.random() * 0.05,
                createdAt: new Date().toISOString(),
            };

        case 'svc-004': // Code Review
            return {
                type: 'code_review',
                executionId,
                issues: [
                    { severity: 'warning', line: 5, message: 'Consider using const instead of let', rule: 'prefer-const' },
                    { severity: 'info', line: 12, message: 'Function could be simplified', rule: 'complexity' },
                ],
                score: 85 + Math.floor(Math.random() * 15),
                suggestions: [
                    'Add type annotations for better type safety',
                    'Consider adding error handling for edge cases',
                    'Extract repeated logic into utility functions',
                ],
                createdAt: new Date().toISOString(),
            };

        case 'svc-005': // Data Extraction
            return {
                type: 'data_extraction',
                executionId,
                data: {
                    title: 'Extracted Document Title',
                    description: 'A comprehensive analysis of the provided content',
                    entities: ['Entity 1', 'Entity 2', 'Entity 3'],
                    keywords: ['AI', 'blockchain', 'payments'],
                },
                confidence: 0.92,
                processingTime: `${(500 + Math.random() * 500).toFixed(0)}ms`,
                createdAt: new Date().toISOString(),
            };

        case 'svc-006': // Audio Transcription
            return {
                type: 'audio_transcription',
                executionId,
                transcript: 'This is a sample transcription of the provided audio content. The speaker discusses various topics related to artificial intelligence and blockchain technology.',
                duration: 45.5,
                language: 'en',
                confidence: 0.94,
                segments: [
                    { start: 0, end: 10, text: 'This is a sample transcription' },
                    { start: 10, end: 25, text: 'of the provided audio content.' },
                    { start: 25, end: 45.5, text: 'The speaker discusses various topics related to AI and blockchain.' },
                ],
                createdAt: new Date().toISOString(),
            };

        default:
            return {
                type: 'generic',
                executionId,
                message: 'Service executed successfully',
                createdAt: new Date().toISOString(),
            };
    }
}

// Generate realistic AI response
function generateAIResponse(prompt: string): string {
    const responses = [
        `Based on your request about "${prompt.slice(0, 30)}...", here's my analysis:

The intersection of AI and blockchain technology is revolutionizing how we think about autonomous systems. AgentPay represents the next generation of payment infrastructure, enabling AI agents to transact seamlessly using the x402 protocol.

Key insights:
1. Native HTTP payments eliminate traditional friction
2. Micropayments become economically viable
3. Machine-to-machine commerce scales infinitely

This paradigm shift enables entirely new business models where autonomous agents can operate independently in the digital economy.`,

        `Regarding "${prompt.slice(0, 30)}...":

The x402 protocol brings a fundamental improvement to internet payments. By leveraging HTTP status code 402 (Payment Required), we can create a native payment layer for the web.

Benefits include:
• Instant settlement on Movement Network
• No account requirements for buyers
• Pay-per-use pricing models
• Perfect for AI agent transactions

The future is agentic, and AgentPay is building the rails.`,

        `Analyzing your prompt: "${prompt.slice(0, 30)}..."

Movement Network provides the ideal foundation for x402 payments due to its:
- High throughput and low latency
- Minimal transaction costs
- EVM compatibility
- Strong developer ecosystem

Combined with the x402 standard, this enables a new category of applications where payment and service delivery are atomic operations.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// Translation helper
function translateText(text: string, targetLang: string): string {
    const translations: Record<string, Record<string, string>> = {
        'Hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', ja: 'こんにちは', zh: '你好' },
        'How are you?': { es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es dir?', ja: 'お元気ですか？', zh: '你好吗？' },
        'Thank you': { es: 'Gracias', fr: 'Merci', de: 'Danke', ja: 'ありがとう', zh: '谢谢' },
    };

    if (translations[text]?.[targetLang]) {
        return translations[text][targetLang];
    }

    return `[${targetLang.toUpperCase()}] ${text}`;
}
