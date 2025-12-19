'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useWallet } from '@/hooks/useWallet';
import { useAgents } from '@/hooks/useAgents';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function AnalyticsPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const { transactions, balance } = useWallet();
    const { agents } = useAgents();
    const [mounted, setMounted] = useState(false);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

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

    // Calculate analytics data
    const analytics = useMemo(() => {
        const now = new Date();
        const ranges = {
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };

        const rangeStart = new Date(now.getTime() - ranges[timeRange]);
        const filteredTx = transactions.filter(tx => new Date(tx.timestamp) >= rangeStart);

        const incoming = filteredTx.filter(tx => tx.type === 'incoming');
        const outgoing = filteredTx.filter(tx => tx.type === 'outgoing');

        const totalIncoming = incoming.reduce((sum, tx) => sum + tx.amount, 0);
        const totalOutgoing = outgoing.reduce((sum, tx) => sum + tx.amount, 0);

        // Service usage breakdown
        const serviceUsage: Record<string, { count: number; amount: number }> = {};
        filteredTx.forEach(tx => {
            if (!serviceUsage[tx.service]) {
                serviceUsage[tx.service] = { count: 0, amount: 0 };
            }
            serviceUsage[tx.service].count++;
            serviceUsage[tx.service].amount += tx.amount;
        });

        // Daily breakdown for chart
        const dailyData: { date: string; incoming: number; outgoing: number }[] = [];
        const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * (timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
            const label = timeRange === '24h'
                ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayTx = filteredTx.filter(tx => {
                const txDate = new Date(tx.timestamp);
                if (timeRange === '24h') {
                    return txDate.getHours() === date.getHours() && txDate.getDate() === date.getDate();
                }
                return txDate.toDateString() === date.toDateString();
            });

            dailyData.push({
                date: label,
                incoming: dayTx.filter(tx => tx.type === 'incoming').reduce((sum, tx) => sum + tx.amount, 0),
                outgoing: dayTx.filter(tx => tx.type === 'outgoing').reduce((sum, tx) => sum + tx.amount, 0),
            });
        }

        return {
            totalIncoming,
            totalOutgoing,
            netFlow: totalIncoming - totalOutgoing,
            transactionCount: filteredTx.length,
            avgTransactionValue: filteredTx.length > 0
                ? filteredTx.reduce((sum, tx) => sum + tx.amount, 0) / filteredTx.length
                : 0,
            serviceUsage: Object.entries(serviceUsage).sort((a, b) => b[1].count - a[1].count),
            dailyData,
        };
    }, [transactions, timeRange]);

    if (!mounted || !demoMode.ready || !demoMode.authenticated) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    // Calculated max for chart scaling
    const maxValue = Math.max(
        ...analytics.dailyData.map(d => Math.max(d.incoming, d.outgoing)),
        0.01
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
            <Sidebar />

            <main className="ml-64 min-h-screen">
                <DashboardHeader user={user} onLogout={demoMode.logout} />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                <span className="gradient-text">Analytics</span>
                            </h1>
                            <p className="text-[var(--text-secondary)]">
                                Track your payment flows and service usage
                            </p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2 bg-[var(--bg-tertiary)] rounded-xl p-1">
                            {(['24h', '7d', '30d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                            ? 'bg-[var(--accent-primary)] text-white'
                                            : 'text-[var(--text-secondary)] hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Current Balance</div>
                            <div className="text-2xl font-bold gradient-text mono-number">
                                {balance.toFixed(2)} MOVE
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Received ({timeRange})</div>
                            <div className="text-2xl font-bold text-[var(--accent-success)] mono-number">
                                +{analytics.totalIncoming.toFixed(4)}
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Spent ({timeRange})</div>
                            <div className="text-2xl font-bold text-[var(--accent-warning)] mono-number">
                                -{analytics.totalOutgoing.toFixed(4)}
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Transactions</div>
                            <div className="text-2xl font-bold mono-number">
                                {analytics.transactionCount}
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Avg Value</div>
                            <div className="text-2xl font-bold mono-number text-[var(--accent-primary)]">
                                {analytics.avgTransactionValue.toFixed(4)}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="lg:col-span-2 glass-card p-6">
                            <h3 className="font-semibold mb-6">Payment Flow</h3>

                            {analytics.dailyData.length > 0 && analytics.transactionCount > 0 ? (
                                <div className="h-64">
                                    <div className="flex items-end justify-between h-full gap-1">
                                        {analytics.dailyData.map((day, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="flex-1 w-full flex flex-col justify-end gap-1">
                                                    {/* Incoming bar */}
                                                    <div
                                                        className="w-full bg-[var(--accent-success)]/80 rounded-t transition-all hover:bg-[var(--accent-success)]"
                                                        style={{ height: `${(day.incoming / maxValue) * 100}%`, minHeight: day.incoming > 0 ? '4px' : '0' }}
                                                        title={`Received: ${day.incoming.toFixed(4)} MOVE`}
                                                    />
                                                    {/* Outgoing bar */}
                                                    <div
                                                        className="w-full bg-[var(--accent-warning)]/80 rounded-t transition-all hover:bg-[var(--accent-warning)]"
                                                        style={{ height: `${(day.outgoing / maxValue) * 100}%`, minHeight: day.outgoing > 0 ? '4px' : '0' }}
                                                        title={`Spent: ${day.outgoing.toFixed(4)} MOVE`}
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--text-tertiary)] mt-2 truncate w-full text-center">
                                                    {day.date}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center justify-center gap-6 mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-[var(--accent-success)]" />
                                            <span className="text-sm text-[var(--text-secondary)]">Received</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-[var(--accent-warning)]" />
                                            <span className="text-sm text-[var(--text-secondary)]">Spent</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)]">
                                    No transaction data for this period
                                </div>
                            )}
                        </div>

                        {/* Service Usage */}
                        <div className="glass-card p-6">
                            <h3 className="font-semibold mb-6">Top Services Used</h3>

                            {analytics.serviceUsage.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.serviceUsage.slice(0, 5).map(([service, data], idx) => (
                                        <div key={service}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{service}</span>
                                                <span className="text-sm text-[var(--text-tertiary)]">{data.count} calls</span>
                                            </div>
                                            <div className="relative h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                                <div
                                                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)]"
                                                    style={{ width: `${(data.count / analytics.serviceUsage[0][1].count) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-[var(--text-tertiary)] mt-1">
                                                {data.amount.toFixed(4)} MOVE spent
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--text-tertiary)]">
                                    No service usage data yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agent Stats */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-6">Agent Performance</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agents.map((agent) => (
                                <div key={agent.id} className="glass-card p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-tertiary)]/20 flex items-center justify-center text-2xl">
                                            🤖
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{agent.name}</h4>
                                            <span className={`text-sm ${agent.status === 'online' ? 'text-[var(--accent-success)]' : 'text-[var(--text-tertiary)]'
                                                }`}>
                                                {agent.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)]">Earned</div>
                                            <div className="font-semibold text-[var(--accent-success)] mono-number">
                                                {agent.stats.totalEarnings.toFixed(2)} MOVE
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)]">Requests</div>
                                            <div className="font-semibold mono-number">
                                                {agent.stats.servicesProvided}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)]">Services</div>
                                            <div className="font-semibold mono-number">
                                                {agent.services.filter(s => s.status === 'active').length} active
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[var(--text-tertiary)]">Rating</div>
                                            <div className="font-semibold flex items-center gap-1">
                                                {agent.stats.rating > 0 ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {agent.stats.rating.toFixed(1)}
                                                    </>
                                                ) : (
                                                    <span className="text-[var(--text-tertiary)]">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
