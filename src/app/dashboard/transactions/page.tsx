'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useWallet } from '@/hooks/useWallet';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function TransactionsPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const { transactions, balance } = useWallet();
    const [mounted, setMounted] = useState(false);
    const [filter, setFilter] = useState('all');

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

    if (!mounted || !demoMode.ready || !demoMode.authenticated) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    const filteredTransactions = filter === 'all'
        ? transactions
        : transactions.filter(tx => tx.type === filter);

    const totalIncoming = transactions
        .filter(tx => tx.type === 'incoming')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalOutgoing = transactions
        .filter(tx => tx.type === 'outgoing')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
            <Sidebar />

            <main className="ml-64 min-h-screen">
                <DashboardHeader user={user} onLogout={demoMode.logout} />

                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="gradient-text">Transactions</span>
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            View your payment history and transaction details
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Current Balance</div>
                            <div className="text-2xl font-bold gradient-text mono-number">
                                {balance.toFixed(2)} MOVE
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Total Received</div>
                            <div className="text-2xl font-bold text-[var(--accent-success)] mono-number">
                                +{totalIncoming.toFixed(4)} MOVE
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Total Spent</div>
                            <div className="text-2xl font-bold text-[var(--accent-warning)] mono-number">
                                -{totalOutgoing.toFixed(4)} MOVE
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Net Flow</div>
                            <div className={`text-2xl font-bold mono-number ${totalIncoming - totalOutgoing >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'
                                }`}>
                                {totalIncoming - totalOutgoing >= 0 ? '+' : ''}{(totalIncoming - totalOutgoing).toFixed(4)} MOVE
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                        {[
                            { value: 'all', label: 'All Transactions' },
                            { value: 'incoming', label: 'Received' },
                            { value: 'outgoing', label: 'Sent' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.value
                                        ? 'bg-[var(--accent-primary)] text-white'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Transactions List */}
                    {filteredTransactions.length > 0 ? (
                        <div className="glass-card overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border-secondary)]">
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Type</th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Service</th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Counterparty</th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Amount</th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Status</th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Date</th>
                                        <th className="text-left p-4 text-sm font-medium text-[var(--text-tertiary)]">Tx Hash</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-[var(--border-secondary)]/50 hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                                            <td className="p-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'incoming'
                                                        ? 'bg-[var(--accent-success)]/10 text-[var(--accent-success)]'
                                                        : 'bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]'
                                                    }`}>
                                                    {tx.type === 'incoming' ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">{tx.service}</td>
                                            <td className="p-4">
                                                <div className="text-sm">{tx.counterparty}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-semibold mono-number ${tx.type === 'incoming' ? 'text-[var(--accent-success)]' : 'text-white'
                                                    }`}>
                                                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount.toFixed(4)} MOVE
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`badge ${tx.status === 'completed' ? 'badge-success' :
                                                        tx.status === 'pending' ? 'badge-warning' : 'badge-error'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-[var(--text-secondary)]">
                                                {formatDate(tx.timestamp)}
                                            </td>
                                            <td className="p-4">
                                                {tx.txHash ? (
                                                    <a
                                                        href={`https://explorer.movementnetwork.xyz/tx/${tx.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-[var(--accent-primary)] hover:underline font-mono"
                                                    >
                                                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-[var(--text-tertiary)]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="glass-card p-16 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                Use the marketplace to make your first payment
                            </p>
                            <a href="/dashboard/marketplace" className="btn-primary inline-block">
                                Browse Marketplace
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
