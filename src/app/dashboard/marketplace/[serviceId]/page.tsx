'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useRealWallet } from '@/hooks/useRealWallet';
import { useX402Service } from '@/hooks/useX402Service';
import { useMarketplace, MarketplaceService } from '@/hooks/useMarketplace';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const demoMode = useDemoMode();
    const { balance, fundWallet } = useRealWallet();
    const { executeService, isProcessing, paymentStep, x402Config, network } = useX402Service();
    const { services, recordServiceUsage } = useMarketplace();

    const [mounted, setMounted] = useState(false);
    const [service, setService] = useState<MarketplaceService | null>(null);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{
        success: boolean;
        data?: Record<string, unknown>;
        error?: string;
        txHash?: string;
        cost?: number;
        x402?: {
            paymentVerified: boolean;
            network: string;
            amount: number;
            asset: string;
        };
        processingTime?: number;
    } | null>(null);
    const [showFundModal, setShowFundModal] = useState(false);
    const [isFunding, setIsFunding] = useState(false);

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
        if (!service || isProcessing) return;

        // Check balance
        if (balance < service.pricePerRequest) {
            setShowFundModal(true);
            return;
        }

        setResult(null);

        try {
            // Execute using x402 flow
            const serviceResult = await executeService(
                service.id,
                service.name,
                service.pricePerRequest,
                service.ownerWalletAddress,
                inputs
            );

            if (serviceResult.success) {
                // Record the usage
                recordServiceUsage(service.id, service.pricePerRequest);
            }

            setResult({
                success: serviceResult.success,
                data: serviceResult.result as Record<string, unknown> | undefined,
                error: serviceResult.error,
                txHash: serviceResult.txHash,
                cost: service.pricePerRequest,
                x402: serviceResult.x402,
                processingTime: serviceResult.processingTime,
            });

        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Execution failed',
            });
        }
    }, [service, inputs, balance, isProcessing, executeService, recordServiceUsage]);

    const handleFund = async () => {
        setIsFunding(true);
        await fundWallet(10);
        setIsFunding(false);
        setShowFundModal(false);
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

    const getPaymentStepLabel = () => {
        switch (paymentStep) {
            case 'requesting': return 'Requesting service...';
            case 'paying': return 'Executing payment on Movement...';
            case 'executing': return 'Service executing...';
            default: return 'Processing...';
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
                                                x402 Enabled
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
                                                    disabled={isProcessing}
                                                />
                                            ) : (
                                                <input
                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                    value={inputs[field.field] || ''}
                                                    onChange={(e) => setInputs(prev => ({ ...prev, [field.field]: e.target.value }))}
                                                    placeholder={field.placeholder}
                                                    className="input-field"
                                                    disabled={isProcessing}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleExecute}
                                        disabled={isProcessing || service.inputSchema.some(f => f.required && !inputs[f.field])}
                                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {getPaymentStepLabel()}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Pay {service.pricePerRequest} MOVE &amp; Execute via x402
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* x402 Flow Visualization */}
                                {isProcessing && (
                                    <div className="mt-6 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--accent-primary)]/30">
                                        <h4 className="text-sm font-semibold text-[var(--accent-primary)] mb-4">x402 Payment Flow</h4>
                                        <div className="space-y-3">
                                            <div className={`flex items-center gap-3 transition-opacity ${paymentStep === 'requesting' || paymentStep === 'paying' || paymentStep === 'executing' ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${paymentStep === 'requesting' ? 'bg-[var(--accent-primary)] text-white animate-pulse' : paymentStep !== 'idle' ? 'bg-[var(--accent-success)] text-white' : 'bg-[var(--bg-secondary)]'}`}>
                                                    {paymentStep !== 'idle' && paymentStep !== 'requesting' ? '✓' : '1'}
                                                </div>
                                                <div>
                                                    <span className="text-sm">Request → HTTP 402 Payment Required</span>
                                                    {paymentStep === 'requesting' && <span className="ml-2 text-xs text-[var(--accent-primary)]">In progress...</span>}
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-3 transition-opacity ${paymentStep === 'paying' || paymentStep === 'executing' ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${paymentStep === 'paying' ? 'bg-[var(--accent-primary)] text-white animate-pulse' : paymentStep === 'executing' ? 'bg-[var(--accent-success)] text-white' : 'bg-[var(--bg-secondary)]'}`}>
                                                    {paymentStep === 'executing' ? '✓' : '2'}
                                                </div>
                                                <div>
                                                    <span className="text-sm">Sign & Submit Payment on Movement</span>
                                                    {paymentStep === 'paying' && <span className="ml-2 text-xs text-[var(--accent-primary)]">Signing...</span>}
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-3 transition-opacity ${paymentStep === 'executing' ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${paymentStep === 'executing' ? 'bg-[var(--accent-primary)] text-white animate-pulse' : 'bg-[var(--bg-secondary)]'}`}>
                                                    3
                                                </div>
                                                <div>
                                                    <span className="text-sm">Retry with PAYMENT-SIGNATURE header</span>
                                                    {paymentStep === 'executing' && <span className="ml-2 text-xs text-[var(--accent-primary)]">Executing...</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 opacity-40">
                                                <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-xs">
                                                    4
                                                </div>
                                                <span className="text-sm">Receive result with PAYMENT-RESPONSE</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                                {result.success ? 'x402 Payment Successful!' : 'Failed'}
                                            </span>
                                            {result.processingTime && (
                                                <span className="text-xs text-[var(--text-tertiary)] ml-2">
                                                    ({(result.processingTime / 1000).toFixed(2)}s)
                                                </span>
                                            )}
                                        </div>

                                        {result.x402 && result.success && (
                                            <div className="mb-3 p-3 rounded-lg bg-[var(--bg-tertiary)] grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-[var(--text-tertiary)]">Network:</span>
                                                    <span className="ml-2 font-mono">{result.x402.network}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[var(--text-tertiary)]">Amount:</span>
                                                    <span className="ml-2 font-mono">{result.x402.amount} {result.x402.asset}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-[var(--text-tertiary)]">Verified:</span>
                                                    <span className="ml-2 text-[var(--accent-success)]">✓ Payment verified via x402</span>
                                                </div>
                                            </div>
                                        )}

                                        {result.txHash && (
                                            <div className="mb-3 p-2 rounded bg-black/20 text-xs font-mono text-[var(--text-tertiary)] break-all">
                                                <span className="text-[var(--text-secondary)]">TX:</span> {result.txHash}
                                            </div>
                                        )}

                                        {result.success && result.data && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-2 text-[var(--text-secondary)]">Service Response:</h4>
                                                <pre className="p-4 rounded-xl bg-[var(--bg-tertiary)] overflow-x-auto text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                                    <code className="text-[var(--text-secondary)]">
                                                        {JSON.stringify(result.data, null, 2)}
                                                    </code>
                                                </pre>
                                            </div>
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

                            {/* Network Info */}
                            <div className="glass-card p-6 border border-[var(--accent-secondary)]/30">
                                <h3 className="font-semibold mb-4 text-[var(--accent-secondary)]">Network</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-tertiary)]">Chain</span>
                                        <span className="font-mono">{network.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-tertiary)]">Chain ID</span>
                                        <span className="font-mono">{network.chainId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-tertiary)]">CAIP-2</span>
                                        <span className="font-mono text-xs">{x402Config.network}</span>
                                    </div>
                                </div>
                            </div>

                            {/* How It Works */}
                            <div className="glass-card p-6 border border-[var(--accent-primary)]/30">
                                <h3 className="font-semibold mb-4 text-[var(--accent-primary)]">x402 Protocol</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">1</div>
                                        <p className="text-[var(--text-secondary)]">Request returns HTTP 402</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">2</div>
                                        <p className="text-[var(--text-secondary)]">Sign payment on Movement</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">3</div>
                                        <p className="text-[var(--text-secondary)]">Retry with payment proof</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center text-xs text-[var(--accent-primary)]">4</div>
                                        <p className="text-[var(--text-secondary)]">Receive result atomically</p>
                                    </div>
                                </div>
                                <a
                                    href="https://x402.org"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 text-xs text-[var(--accent-primary)] hover:underline block"
                                >
                                    Learn more about x402 →
                                </a>
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
                            <button
                                onClick={handleFund}
                                disabled={isFunding}
                                className="btn-primary flex-1"
                            >
                                {isFunding ? 'Funding...' : 'Get 10 MOVE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
