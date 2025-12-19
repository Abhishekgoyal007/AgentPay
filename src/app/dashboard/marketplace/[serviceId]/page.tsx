'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useWallet } from '@/hooks/useWallet';
import { useMarketplace, MarketplaceService } from '@/hooks/useMarketplace';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

// Mock AI responses based on category
const generateMockResponse = (service: MarketplaceService, inputs: Record<string, string>) => {
    const category = service.category;

    switch (category) {
        case 'text-generation':
            const prompt = inputs.prompt || inputs.input || 'Hello';
            return {
                success: true,
                data: {
                    text: `Generated response for: "${prompt.slice(0, 50)}..."

This is a simulated AI response from ${service.agentName}'s ${service.name} service. In a production environment, this would connect to a real AI endpoint.

Key points:
• The x402 payment was processed successfully
• Your MOVE tokens were transferred to the service provider
• The response was generated in real-time

Thank you for using AgentPay's x402 marketplace!`,
                    tokens_used: Math.floor(Math.random() * 500) + 100,
                    model: 'gpt-4-simulation',
                },
            };

        case 'image-generation':
            return {
                success: true,
                data: {
                    image_url: 'https://placehold.co/512x512/8b5cf6/white?text=AI+Generated+Image',
                    prompt: inputs.prompt,
                    resolution: '512x512',
                    style: 'realistic',
                },
            };

        case 'translation':
            return {
                success: true,
                data: {
                    original: inputs.text || 'Hello',
                    translated: `[${inputs.target_lang || 'es'}] Translated: "${inputs.text || 'Hello'}"`,
                    source_lang: 'en',
                    target_lang: inputs.target_lang || 'es',
                    confidence: 0.98,
                },
            };

        case 'code':
            return {
                success: true,
                data: {
                    analysis: 'Code analysis complete',
                    issues_found: 0,
                    suggestions: ['Consider adding type annotations', 'Use async/await for async operations'],
                    security_score: 95,
                },
            };

        case 'data':
            return {
                success: true,
                data: {
                    records_processed: Math.floor(Math.random() * 1000) + 100,
                    insights: ['Pattern A detected in 45% of records', 'Anomaly detected at row 234'],
                    processing_time_ms: Math.floor(Math.random() * 2000) + 500,
                },
            };

        default:
            return {
                success: true,
                data: {
                    result: 'Service executed successfully',
                    input_received: inputs,
                    timestamp: new Date().toISOString(),
                },
            };
    }
};

export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const demoMode = useDemoMode();
    const { balance, makePayment } = useWallet();
    const { services, recordServiceUsage } = useMarketplace();

    const [mounted, setMounted] = useState(false);
    const [service, setService] = useState<MarketplaceService | null>(null);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        data?: Record<string, unknown>;
        error?: string;
        txHash?: string;
        cost?: number;
    } | null>(null);
    const [showFundModal, setShowFundModal] = useState(false);

    const serviceId = params.serviceId as string;

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

    // Find service
    useEffect(() => {
        if (services.length > 0) {
            const found = services.find(s => s.id === serviceId);
            setService(found || null);

            // Initialize inputs from schema
            if (found) {
                const initialInputs: Record<string, string> = {};
                found.inputSchema.forEach(field => {
                    initialInputs[field.field] = '';
                });
                setInputs(initialInputs);
            }
        }
    }, [services, serviceId]);

    const handleExecute = useCallback(async () => {
        if (!service || isExecuting) return;

        // Check balance
        if (balance < service.pricePerRequest) {
            setShowFundModal(true);
            return;
        }

        setIsExecuting(true);
        setResult(null);

        try {
            // Make payment
            const paymentResult = await makePayment(
                service.pricePerRequest,
                service.name,
                service.ownerWalletAddress
            );

            if (!paymentResult.success) {
                setResult({
                    success: false,
                    error: paymentResult.error || 'Payment failed',
                });
                setIsExecuting(false);
                return;
            }

            // Generate response (mock or real API)
            const response = service.apiEndpoint
                ? await callRealApi(service.apiEndpoint, inputs)
                : generateMockResponse(service, inputs);

            // Record the usage
            recordServiceUsage(service.id, service.pricePerRequest);

            setResult({
                success: response.success,
                data: response.data,
                error: response.success ? undefined : 'Service execution failed',
                txHash: paymentResult.txHash,
                cost: service.pricePerRequest,
            });

        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Execution failed',
            });
        }

        setIsExecuting(false);
    }, [service, inputs, balance, makePayment, recordServiceUsage, isExecuting]);

    // Call real API endpoint (if configured)
    const callRealApi = async (endpoint: string, data: Record<string, string>) => {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            return { success: true, data: result };
        } catch {
            return { success: false, data: { error: 'API call failed' } };
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'text-generation': return '📝';
            case 'image-generation': return '🎨';
            case 'translation': return '🌍';
            case 'code': return '💻';
            case 'data': return '📊';
            default: return '⚡';
        }
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
                <main className="ml-64 min-h-screen">
                    <DashboardHeader user={user} onLogout={demoMode.logout} />
                    <div className="p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
                            <p className="text-[var(--text-secondary)] mb-6">
                                This service may have been removed or is no longer available.
                            </p>
                            <Link href="/dashboard/marketplace" className="btn-primary">
                                Back to Marketplace
                            </Link>
                        </div>
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
                    {/* Back Button */}
                    <Link
                        href="/dashboard/marketplace"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-6 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Marketplace
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Service Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="glass-card p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-3xl">
                                        {getCategoryIcon(service.category)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-2xl font-bold">{service.name}</h1>
                                            <span className="px-2 py-1 text-xs rounded-full bg-[var(--accent-success)]/20 text-[var(--accent-success)]">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-[var(--text-secondary)]">
                                            by <span className="text-[var(--accent-primary)]">{service.agentName}</span>
                                        </p>
                                    </div>
                                </div>

                                <p className="text-[var(--text-secondary)] mb-6">
                                    {service.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                        <div className="text-2xl font-bold gradient-text mono-number">
                                            {service.pricePerRequest}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">MOVE/request</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                        <div className="text-2xl font-bold mono-number">
                                            {service.requests.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">Requests</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                        <div className="text-2xl font-bold mono-number flex items-center justify-center gap-1">
                                            {service.rating > 0 ? (
                                                <>
                                                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {service.rating.toFixed(1)}
                                                </>
                                            ) : (
                                                <span className="text-[var(--text-tertiary)]">-</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">Rating</div>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                        <div className="text-2xl font-bold mono-number text-[var(--accent-success)]">
                                            {service.revenue.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">MOVE earned</div>
                                    </div>
                                </div>
                            </div>

                            {/* Try It Out */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold mb-4">Try It Out</h2>

                                <div className="space-y-4">
                                    {service.inputSchema.map((field) => (
                                        <div key={field.field}>
                                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                                {field.description}
                                                {field.required && <span className="text-[var(--accent-error)] ml-1">*</span>}
                                            </label>
                                            {field.type === 'string' && field.description.toLowerCase().includes('url') ||
                                                field.field === 'code' || field.field === 'text' ? (
                                                <textarea
                                                    value={inputs[field.field] || ''}
                                                    onChange={(e) => setInputs(prev => ({ ...prev, [field.field]: e.target.value }))}
                                                    placeholder={field.placeholder}
                                                    className="input-field min-h-[100px] resize-none"
                                                />
                                            ) : (
                                                <input
                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                    value={inputs[field.field] || ''}
                                                    onChange={(e) => setInputs(prev => ({ ...prev, [field.field]: e.target.value }))}
                                                    placeholder={field.placeholder}
                                                    className="input-field"
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleExecute}
                                        disabled={isExecuting || service.inputSchema.some(f => f.required && !inputs[f.field])}
                                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isExecuting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                                </div>

                                {/* Result */}
                                {result && (
                                    <div className={`mt-6 p-4 rounded-xl ${result.success
                                            ? 'bg-[var(--accent-success)]/10 border border-[var(--accent-success)]/30'
                                            : 'bg-[var(--accent-error)]/10 border border-[var(--accent-error)]/30'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            {result.success ? (
                                                <svg className="w-5 h-5 text-[var(--accent-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-[var(--accent-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                            <span className={`font-semibold ${result.success ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'}`}>
                                                {result.success ? 'Success!' : 'Failed'}
                                            </span>
                                            {result.cost && (
                                                <span className="text-sm text-[var(--text-tertiary)] ml-2">
                                                    Cost: {result.cost} MOVE
                                                </span>
                                            )}
                                        </div>

                                        {result.txHash && (
                                            <div className="mb-3 p-2 rounded bg-black/20 text-xs font-mono text-[var(--text-tertiary)] break-all">
                                                TX: {result.txHash}
                                            </div>
                                        )}

                                        {result.success && result.data && (
                                            <pre className="p-4 rounded-xl bg-[var(--bg-tertiary)] overflow-x-auto text-sm whitespace-pre-wrap">
                                                <code className="text-[var(--text-secondary)]">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </code>
                                            </pre>
                                        )}

                                        {!result.success && result.error && (
                                            <p className="text-[var(--accent-error)]">{result.error}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Your Balance */}
                            <div className="glass-card p-6">
                                <h3 className="font-semibold mb-4">Your Balance</h3>
                                <div className="text-3xl font-bold gradient-text mono-number mb-2">
                                    {balance.toFixed(2)} MOVE
                                </div>
                                {balance < service.pricePerRequest && (
                                    <p className="text-sm text-[var(--accent-warning)] mb-4">
                                        Insufficient balance for this service
                                    </p>
                                )}
                                <Link href="/dashboard" className="btn-secondary w-full text-center block">
                                    Get More MOVE
                                </Link>
                            </div>

                            {/* Provider Info */}
                            <div className="glass-card p-6">
                                <h3 className="font-semibold mb-4">Provider</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-lg">
                                        🤖
                                    </div>
                                    <div>
                                        <div className="font-medium">{service.agentName}</div>
                                        <div className="text-xs text-[var(--text-tertiary)] font-mono">
                                            {service.ownerWalletAddress.slice(0, 8)}...{service.ownerWalletAddress.slice(-6)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* How It Works */}
                            <div className="glass-card p-6 border border-[var(--accent-primary)]/30">
                                <h3 className="font-semibold mb-4 text-[var(--accent-primary)]">x402 Payment Flow</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">1</div>
                                        <p className="text-[var(--text-secondary)]">You click &quot;Pay & Execute&quot;</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">2</div>
                                        <p className="text-[var(--text-secondary)]">Payment is verified atomically</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">3</div>
                                        <p className="text-[var(--text-secondary)]">Service executes & returns result</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">4</div>
                                        <p className="text-[var(--text-secondary)]">Provider receives payment instantly</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Insufficient Balance Modal */}
            {showFundModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-card p-8 w-full max-w-md mx-4 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--accent-warning)]/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-[var(--accent-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Insufficient Balance</h2>
                        <p className="text-[var(--text-secondary)] mb-6">
                            You need at least {service.pricePerRequest} MOVE to use this service.
                            <br />
                            Current balance: {balance.toFixed(4)} MOVE
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFundModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <Link href="/dashboard" className="btn-primary flex-1 text-center">
                                Get MOVE
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
