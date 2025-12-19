'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

// Mock service data - same as marketplace
const mockServices: Record<string, {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    category: string;
    pricePerRequest: number;
    agent: { name: string; rating: number; avatar: string; address: string };
    stats: { requests: number; successRate: number; avgResponseTime: number };
    tags: string[];
    inputSchema: { field: string; type: string; required: boolean; description: string }[];
    outputExample: object;
}> = {
    'svc-001': {
        id: 'svc-001',
        name: 'GPT-4 Text Generation',
        description: 'High-quality text generation powered by GPT-4.',
        longDescription: 'Generate high-quality text content using OpenAI\'s GPT-4 model. Perfect for content creation, summaries, creative writing, code generation, and more. Supports system prompts, temperature control, and context preservation.',
        category: 'ai-generation',
        pricePerRequest: 0.01,
        agent: { name: 'TextMaster AI', rating: 4.9, avatar: '🤖', address: '0xABC...DEF' },
        stats: { requests: 15420, successRate: 99.8, avgResponseTime: 1200 },
        tags: ['AI', 'Writing', 'GPT-4', 'Text'],
        inputSchema: [
            { field: 'prompt', type: 'string', required: true, description: 'The text prompt to generate from' },
            { field: 'max_tokens', type: 'number', required: false, description: 'Maximum tokens to generate (default: 500)' },
            { field: 'temperature', type: 'number', required: false, description: 'Creativity level 0-1 (default: 0.7)' },
        ],
        outputExample: { text: 'Generated text content...', tokens_used: 150, model: 'gpt-4' },
    },
    'svc-002': {
        id: 'svc-002',
        name: 'Image Generation (SDXL)',
        description: 'Create stunning images from text prompts using Stable Diffusion XL.',
        longDescription: 'Generate beautiful, high-resolution images from text descriptions using Stable Diffusion XL. Supports various styles, aspect ratios, and negative prompts for fine-tuned control over the output.',
        category: 'ai-generation',
        pricePerRequest: 0.05,
        agent: { name: 'PixelForge', rating: 4.8, avatar: '🎨', address: '0x123...456' },
        stats: { requests: 8730, successRate: 99.5, avgResponseTime: 5000 },
        tags: ['AI', 'Images', 'SDXL', 'Art'],
        inputSchema: [
            { field: 'prompt', type: 'string', required: true, description: 'Text description of the image to generate' },
            { field: 'negative_prompt', type: 'string', required: false, description: 'What to avoid in the image' },
            { field: 'width', type: 'number', required: false, description: 'Image width (default: 1024)' },
            { field: 'height', type: 'number', required: false, description: 'Image height (default: 1024)' },
        ],
        outputExample: { url: 'https://...', width: 1024, height: 1024, seed: 12345 },
    },
    'svc-003': {
        id: 'svc-003',
        name: 'Real-time Translation',
        description: 'Translate text between 100+ languages with near-native quality.',
        longDescription: 'Professional-grade translation supporting over 100 languages. Uses advanced neural machine translation with context awareness for accurate, natural-sounding translations.',
        category: 'translation',
        pricePerRequest: 0.002,
        agent: { name: 'LinguaBot', rating: 4.7, avatar: '🌍', address: '0x789...012' },
        stats: { requests: 42100, successRate: 99.9, avgResponseTime: 300 },
        tags: ['Translation', 'Languages', 'NLP'],
        inputSchema: [
            { field: 'text', type: 'string', required: true, description: 'Text to translate' },
            { field: 'source_lang', type: 'string', required: false, description: 'Source language (auto-detect if omitted)' },
            { field: 'target_lang', type: 'string', required: true, description: 'Target language code (e.g., "es", "fr", "de")' },
        ],
        outputExample: { translated: 'Hola mundo', source_lang: 'en', target_lang: 'es' },
    },
};

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const demoMode = useDemoMode();
    const [mounted, setMounted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [testInput, setTestInput] = useState('');
    const [testResult, setTestResult] = useState<string | null>(null);

    const serviceId = params.serviceId as string;
    const service = mockServices[serviceId];

    const user = demoMode.demoUser ? {
        email: { address: demoMode.demoUser.email },
        wallet: { address: demoMode.demoUser.wallet.address },
    } : null;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (demoMode.ready && !demoMode.authenticated) {
            router.push('/');
        }
    }, [demoMode.ready, demoMode.authenticated, router]);

    const handleTestService = async () => {
        setIsProcessing(true);
        setTestResult(null);

        // Simulate x402 payment flow
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock response
        setTestResult(JSON.stringify({
            success: true,
            payment: { amount: service?.pricePerRequest, status: 'completed' },
            result: service?.outputExample,
        }, null, 2));

        setIsProcessing(false);
    };

    if (!mounted || !demoMode.ready || !demoMode.authenticated) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
                <Sidebar />
                <main className="ml-64 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
                        <Link href="/dashboard/marketplace" className="btn-primary">
                            Back to Marketplace
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
            <Sidebar />

            <main className="ml-64 min-h-screen">
                <DashboardHeader user={user} onLogout={demoMode.logout} />

                <div className="p-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] mb-6">
                        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        <span>/</span>
                        <Link href="/dashboard/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
                        <span>/</span>
                        <span className="text-white">{service.name}</span>
                    </div>

                    {/* Service Header */}
                    <div className="glass-card p-8 mb-6">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-tertiary)]/20 flex items-center justify-center text-4xl">
                                {service.agent.avatar}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold">{service.name}</h1>
                                    <span className="badge badge-success">Active</span>
                                </div>
                                <p className="text-[var(--text-secondary)] mb-4">{service.longDescription}</p>
                                <div className="flex flex-wrap gap-2">
                                    {service.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 text-xs rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold gradient-text mono-number mb-1">
                                    {service.pricePerRequest} MOVE
                                </div>
                                <div className="text-sm text-[var(--text-tertiary)]">per request</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="glass-card p-6 text-center">
                                    <div className="text-2xl font-bold mono-number text-[var(--accent-primary)]">
                                        {(service.stats.requests / 1000).toFixed(1)}K
                                    </div>
                                    <div className="text-sm text-[var(--text-tertiary)]">Total Requests</div>
                                </div>
                                <div className="glass-card p-6 text-center">
                                    <div className="text-2xl font-bold mono-number text-[var(--accent-success)]">
                                        {service.stats.successRate}%
                                    </div>
                                    <div className="text-sm text-[var(--text-tertiary)]">Success Rate</div>
                                </div>
                                <div className="glass-card p-6 text-center">
                                    <div className="text-2xl font-bold mono-number text-[var(--accent-tertiary)]">
                                        {service.stats.avgResponseTime}ms
                                    </div>
                                    <div className="text-sm text-[var(--text-tertiary)]">Avg Response</div>
                                </div>
                            </div>

                            {/* Input Schema */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
                                <div className="space-y-3">
                                    {service.inputSchema.map((param, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <code className="text-[var(--accent-primary)] font-mono">{param.field}</code>
                                                <span className="text-xs text-[var(--text-tertiary)]">({param.type})</span>
                                                {param.required && (
                                                    <span className="text-xs text-[var(--accent-error)]">required</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)]">{param.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Output Example */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold mb-4">Example Output</h2>
                                <pre className="p-4 rounded-xl bg-[var(--bg-tertiary)] overflow-x-auto">
                                    <code className="text-sm text-[var(--text-secondary)]">
                                        {JSON.stringify(service.outputExample, null, 2)}
                                    </code>
                                </pre>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Provider Info */}
                            <div className="glass-card p-6">
                                <h3 className="font-semibold mb-4">Service Provider</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-tertiary)]/20 flex items-center justify-center text-2xl">
                                        {service.agent.avatar}
                                    </div>
                                    <div>
                                        <div className="font-medium">{service.agent.name}</div>
                                        <div className="flex items-center gap-1 text-sm text-[var(--text-tertiary)]">
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {service.agent.rating}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-[var(--text-tertiary)] font-mono">
                                    {service.agent.address}
                                </div>
                            </div>

                            {/* Try It Out */}
                            <div className="glass-card p-6">
                                <h3 className="font-semibold mb-4">Try It Out</h3>
                                <textarea
                                    value={testInput}
                                    onChange={(e) => setTestInput(e.target.value)}
                                    placeholder="Enter your test input..."
                                    className="input-field mb-4 min-h-[100px] resize-none"
                                />
                                <button
                                    onClick={handleTestService}
                                    disabled={isProcessing}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="spinner" />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Pay {service.pricePerRequest} MOVE & Execute
                                        </>
                                    )}
                                </button>

                                {testResult && (
                                    <div className="mt-4">
                                        <div className="text-sm text-[var(--accent-success)] mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Payment Successful!
                                        </div>
                                        <pre className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-xs overflow-x-auto">
                                            <code>{testResult}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* x402 Info */}
                            <div className="glass-card p-6 border-[var(--accent-primary)]/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="font-semibold text-[var(--accent-primary)]">Powered by x402</h3>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    This service uses the x402 payment protocol. Your payment is processed instantly and atomically with the service execution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
