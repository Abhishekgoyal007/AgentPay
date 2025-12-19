'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useWallet } from '@/hooks/useWallet';
import { useAgents } from '@/hooks/useAgents';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

export default function DashboardPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const { balance, transactions, fundWallet, isConnected } = useWallet();
    const { agents, isLoading: agentsLoading } = useAgents();
    const [isFunding, setIsFunding] = useState(false);

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

    const handleFundWallet = async () => {
        setIsFunding(true);
        await fundWallet(10);
        setIsFunding(false);
    };

    if (!mounted || !demoMode.ready || !demoMode.authenticated) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    // Calculate stats from real data
    const totalEarnings = agents.reduce((sum, a) => sum + a.stats.totalEarnings, 0);
    const totalSpent = transactions
        .filter(tx => tx.type === 'outgoing')
        .reduce((sum, tx) => sum + tx.amount, 0);
    const servicesProvided = agents.reduce((sum, a) => sum + a.stats.servicesProvided, 0);
    const activeServices = agents.reduce((sum, a) =>
        sum + a.services.filter(s => s.status === 'active').length, 0
    );

    const primaryAgent = agents[0];
    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
            <Sidebar />

            <main className="ml-64 min-h-screen">
                <DashboardHeader user={user} onLogout={demoMode.logout} />
                <div className="p-8">
                    {/* Testnet Banner */}
                    <div className="mb-6 p-4 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-[var(--accent-primary)] font-medium">Movement Testnet</span>
                                    <span className="text-[var(--text-secondary)] ml-2">
                                        Balance: <span className="font-semibold text-white">{balance.toFixed(2)} MOVE</span>
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleFundWallet}
                                disabled={isFunding}
                                className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/80 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                {isFunding ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Get 10 MOVE
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, <span className="gradient-text">{user?.email?.address?.split('@')[0] || 'Agent'}</span>
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Here&apos;s what&apos;s happening with your agents today.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-[var(--accent-success)]/10 text-[var(--accent-success)]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold mono-number text-[var(--accent-success)]">{totalEarnings.toFixed(2)}</span>
                                    <span className="text-sm text-[var(--text-tertiary)]">MOVE</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">Total Earnings</p>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold mono-number">{totalSpent.toFixed(2)}</span>
                                    <span className="text-sm text-[var(--text-tertiary)]">MOVE</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">Total Spent</p>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold mono-number">{servicesProvided}</span>
                                    <span className="text-sm text-[var(--text-tertiary)]">requests</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">Services Provided</p>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold mono-number">{activeServices}</span>
                                    <span className="text-sm text-[var(--text-tertiary)]">online</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">Active Services</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-6 mt-8">
                        {/* Agent Card */}
                        <div className="lg:col-span-2">
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">Your Agent</h2>
                                    <Link href="/dashboard/agents" className="text-sm text-[var(--accent-primary)] hover:underline">
                                        Manage
                                    </Link>
                                </div>

                                {agentsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="spinner" />
                                    </div>
                                ) : primaryAgent ? (
                                    <>
                                        {/* Agent Header */}
                                        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-2xl">
                                                🤖
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold">{primaryAgent.name}</h3>
                                                    <span className={`w-2 h-2 rounded-full ${primaryAgent.status === 'online' ? 'bg-[var(--accent-success)]' : 'bg-[var(--text-tertiary)]'
                                                        }`} />
                                                    <span className={`text-sm ${primaryAgent.status === 'online' ? 'text-[var(--accent-success)]' : 'text-[var(--text-tertiary)]'
                                                        }`}>
                                                        {primaryAgent.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-[var(--text-tertiary)] font-mono">
                                                    {primaryAgent.walletAddress.slice(0, 10)}...{primaryAgent.walletAddress.slice(-8)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-[var(--text-tertiary)]">Balance</div>
                                                <div className="text-xl font-bold mono-number gradient-text">{balance.toFixed(2)} MOVE</div>
                                            </div>
                                        </div>

                                        {/* Services */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium text-[var(--text-secondary)]">Active Services</h4>
                                                <Link href="/dashboard/agents" className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Service
                                                </Link>
                                            </div>

                                            <div className="space-y-3">
                                                {primaryAgent.services.length > 0 ? (
                                                    primaryAgent.services.map((service) => (
                                                        <div
                                                            key={service.id}
                                                            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-[var(--accent-success)]' : 'bg-[var(--text-tertiary)]'
                                                                    }`} />
                                                                <span className="font-medium">{service.name}</span>
                                                                {service.status === 'paused' && (
                                                                    <span className="badge badge-warning text-xs">Paused</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-6 text-sm">
                                                                <div className="text-center">
                                                                    <div className="text-[var(--text-tertiary)]">Requests</div>
                                                                    <div className="font-semibold mono-number">{service.requests}</div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="text-[var(--text-tertiary)]">Revenue</div>
                                                                    <div className="font-semibold mono-number text-[var(--accent-success)]">
                                                                        {service.revenue.toFixed(2)} MOVE
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-[var(--text-tertiary)]">
                                                        No services yet. Add one to start earning!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-[var(--text-tertiary)]">No agents found. Create one to get started!</p>
                                        <Link href="/dashboard/agents" className="btn-primary mt-4 inline-block">
                                            Create Agent
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="glass-card p-6 h-fit">
                            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

                            <div className="space-y-3">
                                <Link href="/dashboard/agents" className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all group">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium group-hover:text-[var(--accent-primary)]">Create Agent</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Set up a new AI agent</div>
                                    </div>
                                    <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/dashboard/marketplace" className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all group">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-warning)]/15 text-[var(--accent-warning)]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium group-hover:text-[var(--accent-warning)]">Browse Marketplace</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Find AI services</div>
                                    </div>
                                    <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>

                                <Link href="/dashboard/transactions" className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all group">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--accent-success)]/15 text-[var(--accent-success)]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium group-hover:text-[var(--accent-success)]">View Transactions</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Payment history</div>
                                    </div>
                                    <svg className="w-5 h-5 text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-8">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                                <Link href="/dashboard/transactions" className="text-sm text-[var(--accent-primary)] hover:underline">
                                    View all
                                </Link>
                            </div>

                            {recentTransactions.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTransactions.map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'incoming'
                                                    ? 'bg-[var(--accent-success)]/10 text-[var(--accent-success)]'
                                                    : 'bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]'
                                                    }`}>
                                                    {tx.type === 'incoming' ? (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{tx.service}</div>
                                                    <div className="text-sm text-[var(--text-tertiary)]">
                                                        {tx.type === 'incoming' ? `From ${tx.counterparty}` : `To ${tx.counterparty}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-semibold mono-number ${tx.type === 'incoming' ? 'text-[var(--accent-success)]' : 'text-white'
                                                    }`}>
                                                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toFixed(4)} MOVE
                                                </div>
                                                <div className="text-sm text-[var(--text-tertiary)]">
                                                    {new Date(tx.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--text-tertiary)]">
                                    No transactions yet. Use the marketplace to make your first payment!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
