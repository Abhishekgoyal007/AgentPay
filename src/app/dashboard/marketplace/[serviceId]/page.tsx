'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useX402Service } from '@/hooks/useX402Service';
import { useWallet } from '@/hooks/useWallet';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

// Service definitions with full details
const servicesData: Record<string, {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    category: string;
    pricePerRequest: number;
    agent: { name: string; rating: number; avatar: string; address: string };
    stats: { requests: number; successRate: number; avgResponseTime: number };
    tags: string[];
    inputSchema: { field: string; type: string; required: boolean; description: string; placeholder?: string }[];
}> = {
    'svc-001': {
        id: 'svc-001',
        name: 'GPT-4 Text Generation',
        description: 'High-quality text generation powered by GPT-4.',
        longDescription: 'Generate high-quality text content using OpenAI\'s GPT-4 model. Perfect for content creation, summaries, creative writing, code generation, and more.',
        category: 'ai-generation',
        pricePerRequest: 0.01,
        agent: { name: 'TextMaster AI', rating: 4.9, avatar: '🤖', address: '0xABC...DEF' },
        stats: { requests: 15420, successRate: 99.8, avgResponseTime: 1200 },
        tags: ['AI', 'Writing', 'GPT-4', 'Text'],
        inputSchema: [
            { field: 'prompt', type: 'string', required: true, description: 'The text prompt to generate from', placeholder: 'Write a short story about...' },
        ],
    },
    'svc-002': {
        id: 'svc-002',
        name: 'Image Generation (SDXL)',
        description: 'Create stunning images from text prompts.',
        longDescription: 'Generate beautiful, high-resolution images from text descriptions using Stable Diffusion XL.',
        category: 'ai-generation',
        pricePerRequest: 0.05,
        agent: { name: 'PixelForge', rating: 4.8, avatar: '🎨', address: '0x123...456' },
        stats: { requests: 8730, successRate: 99.5, avgResponseTime: 5000 },
        tags: ['AI', 'Images', 'SDXL', 'Art'],
        inputSchema: [
            { field: 'prompt', type: 'string', required: true, description: 'Text description of the image', placeholder: 'A futuristic city at sunset...' },
        ],
    },
    'svc-003': {
        id: 'svc-003',
        name: 'Real-time Translation',
        description: 'Translate text between 100+ languages.',
        longDescription: 'Professional-grade translation supporting over 100 languages with context awareness.',
        category: 'translation',
        pricePerRequest: 0.002,
        agent: { name: 'LinguaBot', rating: 4.7, avatar: '🌍', address: '0x789...012' },
        stats: { requests: 42100, successRate: 99.9, avgResponseTime: 300 },
        tags: ['Translation', 'Languages', 'NLP'],
        inputSchema: [
            { field: 'text', type: 'string', required: true, description: 'Text to translate', placeholder: 'Hello, how are you?' },
            { field: 'target_lang', type: 'string', required: true, description: 'Target language code', placeholder: 'es' },
        ],
    },
    'svc-004': {
        id: 'svc-004',
        name: 'Code Review & Analysis',
        description: 'Automated code review with security analysis.',
        longDescription: 'Get automated code reviews with security analysis, best practices, and performance tips.',
        category: 'analysis',
        pricePerRequest: 0.03,
        agent: { name: 'CodeSentry', rating: 4.9, avatar: '🔍', address: '0xCDE...789' },
        stats: { requests: 5240, successRate: 99.6, avgResponseTime: 2000 },
        tags: ['Code', 'Security', 'Review'],
        inputSchema: [
            { field: 'code', type: 'string', required: true, description: 'Code to review', placeholder: 'function example() { ... }' },
        ],
    },
    'svc-005': {
        id: 'svc-005',
        name: 'Data Extraction API',
        description: 'Extract structured data from documents.',
        longDescription: 'Extract structured data from websites, PDFs, and documents. Returns clean JSON output.',
        category: 'data-processing',
        pricePerRequest: 0.008,
        agent: { name: 'DataMiner', rating: 4.6, avatar: '⛏️', address: '0xEFG...123' },
        stats: { requests: 28900, successRate: 98.7, avgResponseTime: 1500 },
        tags: ['Data', 'Scraping', 'ETL'],
        inputSchema: [
            { field: 'url', type: 'string', required: true, description: 'URL or text to extract from', placeholder: 'https://example.com' },
        ],
    },
    'svc-006': {
        id: 'svc-006',
        name: 'Audio Transcription',
        description: 'Convert audio to text with timestamps.',
        longDescription: 'Convert audio files to text with speaker diarization and timestamp support.',
        category: 'data-processing',
        pricePerRequest: 0.02,
        agent: { name: 'TranscribeAI', rating: 4.8, avatar: '🎙️', address: '0xHIJ...456' },
        stats: { requests: 11200, successRate: 99.2, avgResponseTime: 3000 },
        tags: ['Audio', 'Transcription', 'Speech'],
        inputSchema: [
            { field: 'audio_url', type: 'string', required: true, description: 'URL to audio file', placeholder: 'https://example.com/audio.mp3' },
        ],
    },
};

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const demoMode = useDemoMode();
    const { executeService, isProcessing } = useX402Service();
    const { balance, fundWallet } = useWallet();
    const [mounted, setMounted] = useState(false);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ success: boolean; data?: unknown; error?: string; txHash?: string } | null>(null);
    const [showFundModal, setShowFundModal] = useState(false);

    const serviceId = params.serviceId as string;
    const service = servicesData[serviceId];

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

    const handleInputChange = (field: string, value: string) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const handleExecute = async () => {
        if (!service) return;

        // Check balance
        if (balance < service.pricePerRequest) {
            setShowFundModal(true);
            return;
        }

        setResult(null);

        const response = await executeService(
            service.id,
            service.name,
            service.pricePerRequest,
            service.agent.address,
            inputs
        );

        if (response.success) {
            setResult({
                success: true,
                data: response.result,
                txHash: response.txHash,
            });
        } else {
            setResult({
                success: false,
                error: response.error,
            });
        }
    };

    const handleFund = async () => {
        await fundWallet(10);
        setShowFundModal(false);
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

    const canAfford = balance >= service.pricePerRequest;

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
                                <div className="mt-2 text-sm">
                                    Your balance: <span className={`font-semibold ${canAfford ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'}`}>
                                        {balance.toFixed(4)} MOVE
                                    </span>
                                </div>
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

                            {/* Result Display */}
                            {result && (
                                <div className={`glass-card p-6 border ${result.success ? 'border-[var(--accent-success)]/30' : 'border-[var(--accent-error)]/30'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        {result.success ? (
                                            <>
                                                <svg className="w-5 h-5 text-[var(--accent-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="font-semibold text-[var(--accent-success)]">Execution Successful!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 text-[var(--accent-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span className="font-semibold text-[var(--accent-error)]">Execution Failed</span>
                                            </>
                                        )}
                                    </div>

                                    {result.txHash && (
                                        <div className="mb-4 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                                            <div className="text-xs text-[var(--text-tertiary)] mb-1">Transaction Hash</div>
                                            <a
                                                href={`https://explorer.movementnetwork.xyz/tx/${result.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-mono text-[var(--accent-primary)] hover:underline break-all"
                                            >
                                                {result.txHash}
                                            </a>
                                        </div>
                                    )}

                                    {result.success && result.data !== undefined && (
                                        <div>
                                            <div className="text-sm text-[var(--text-tertiary)] mb-2">Response:</div>
                                            <pre className="p-4 rounded-xl bg-[var(--bg-tertiary)] overflow-x-auto text-sm whitespace-pre-wrap">
                                                <code className="text-[var(--text-secondary)]">
                                                    {JSON.stringify(result.data as Record<string, unknown>, null, 2)}
                                                </code>
                                            </pre>
                                        </div>
                                    )}

                                    {!result.success && result.error && (
                                        <p className="text-[var(--accent-error)]">{result.error}</p>
                                    )}
                                </div>
                            )}

                            {/* x402 Payment Flow Info */}
                            <div className="glass-card p-6 border border-[var(--accent-primary)]/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <h3 className="font-semibold text-lg">x402 Payment Protocol</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center text-xs font-bold">1</span>
                                        <p className="text-[var(--text-secondary)]">You submit a request with payment signature</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center text-xs font-bold">2</span>
                                        <p className="text-[var(--text-secondary)]">Payment is verified atomically with service execution</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center text-xs font-bold">3</span>
                                        <p className="text-[var(--text-secondary)]">Result returned instantly with payment receipt</p>
                                    </div>
                                </div>
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

                            {/* Execute Service */}
                            <div className="glass-card p-6">
                                <h3 className="font-semibold mb-4">Execute Service</h3>

                                <div className="space-y-4 mb-6">
                                    {service.inputSchema.map((input) => (
                                        <div key={input.field}>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                {input.field}
                                                {input.required && <span className="text-[var(--accent-error)] ml-1">*</span>}
                                            </label>
                                            {input.type === 'string' && input.field.includes('code') || input.field.includes('prompt') ? (
                                                <textarea
                                                    value={inputs[input.field] || ''}
                                                    onChange={(e) => handleInputChange(input.field, e.target.value)}
                                                    placeholder={input.placeholder || input.description}
                                                    className="input-field min-h-[100px] resize-none"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={inputs[input.field] || ''}
                                                    onChange={(e) => handleInputChange(input.field, e.target.value)}
                                                    placeholder={input.placeholder || input.description}
                                                    className="input-field"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleExecute}
                                    disabled={isProcessing || service.inputSchema.some(i => i.required && !inputs[i.field])}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
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

                                {!canAfford && (
                                    <p className="mt-2 text-sm text-[var(--accent-error)] text-center">
                                        Insufficient balance. You need {service.pricePerRequest} MOVE.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fund Wallet Modal */}
            {showFundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-card p-8 w-full max-w-md mx-4">
                        <h2 className="text-2xl font-bold mb-4">Insufficient Balance</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            You need at least {service.pricePerRequest} MOVE to use this service.
                            Your current balance is {balance.toFixed(4)} MOVE.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFundModal(false)}
                                className="flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFund}
                                className="flex-1 btn-primary"
                            >
                                Get 10 MOVE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
