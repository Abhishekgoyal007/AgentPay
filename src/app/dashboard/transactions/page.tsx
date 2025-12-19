'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

// Mock transaction data
const mockTransactions = [
    {
        id: 'tx-001',
        type: 'incoming',
        service: 'Image Generation',
        counterparty: 'Agent-7x2k',
        counterpartyAddress: '0xABC...123',
        amount: 0.05,
        status: 'completed',
        timestamp: '2024-12-19T10:30:00Z',
        txHash: '0x1234...5678',
    },
    {
        id: 'tx-002',
        type: 'outgoing',
        service: 'Data Analysis',
        counterparty: 'Agent-m4n9',
        counterpartyAddress: '0xDEF...456',
        amount: 0.12,
        status: 'completed',
        timestamp: '2024-12-19T10:15:00Z',
        txHash: '0x2345...6789',
    },
    {
        id: 'tx-003',
        type: 'incoming',
        service: 'Text Translation',
        counterparty: 'Agent-p3q8',
        counterpartyAddress: '0xGHI...789',
        amount: 0.02,
        status: 'completed',
        timestamp: '2024-12-19T09:45:00Z',
        txHash: '0x3456...7890',
    },
    {
        id: 'tx-004',
        type: 'incoming',
        service: 'Code Review',
        counterparty: 'Agent-k9w2',
        counterpartyAddress: '0xJKL...012',
        amount: 0.08,
        status: 'completed',
        timestamp: '2024-12-19T09:00:00Z',
        txHash: '0x4567...8901',
    },
    {
        id: 'tx-005',
        type: 'outgoing',
        service: 'Audio Transcription',
        counterparty: 'Agent-v5r1',
        counterpartyAddress: '0xMNO...345',
        amount: 0.03,
        status: 'completed',
        timestamp: '2024-12-19T08:30:00Z',
        txHash: '0x5678...9012',
    },
    {
        id: 'tx-006',
        type: 'incoming',
        service: 'GPT-4 Text Generation',
        counterparty: 'Agent-x2y3',
        counterpartyAddress: '0xPQR...678',
        amount: 0.01,
        status: 'completed',
        timestamp: '2024-12-18T22:00:00Z',
        txHash: '0x6789...0123',
    },
    {
        id: 'tx-007',
        type: 'outgoing',
        service: 'Image Generation',
        counterparty: 'Agent-z1a2',
        counterpartyAddress: '0xSTU...901',
        amount: 0.05,
        status: 'completed',
        timestamp: '2024-12-18T20:30:00Z',
        txHash: '0x7890...1234',
    },
];

export default function TransactionsPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
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
        ? mockTransactions
        : mockTransactions.filter(tx => tx.type === filter);

    const totalIncoming = mockTransactions
        .filter(tx => tx.type === 'incoming')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalOutgoing = mockTransactions
        .filter(tx => tx.type === 'outgoing')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Total Received</div>
                            <div className="text-2xl font-bold text-[var(--accent-success)] mono-number">
                                +{totalIncoming.toFixed(2)} MOVE
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Total Spent</div>
                            <div className="text-2xl font-bold text-[var(--accent-warning)] mono-number">
                                -{totalOutgoing.toFixed(2)} MOVE
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <div className="text-sm text-[var(--text-tertiary)] mb-1">Net Balance</div>
                            <div className={`text-2xl font-bold mono-number ${totalIncoming - totalOutgoing >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-error)]'
                                }`}>
                                {totalIncoming - totalOutgoing >= 0 ? '+' : ''}{(totalIncoming - totalOutgoing).toFixed(2)} MOVE
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
                                            <div>
                                                <div className="text-sm">{tx.counterparty}</div>
                                                <div className="text-xs text-[var(--text-tertiary)] font-mono">{tx.counterpartyAddress}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-semibold mono-number ${tx.type === 'incoming' ? 'text-[var(--accent-success)]' : 'text-white'
                                                }`}>
                                                {tx.type === 'incoming' ? '+' : '-'}{tx.amount} MOVE
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="badge badge-success">
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--text-secondary)]">
                                            {formatDate(tx.timestamp)}
                                        </td>
                                        <td className="p-4">
                                            <a
                                                href={`https://explorer.movementnetwork.xyz/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[var(--accent-primary)] hover:underline font-mono"
                                            >
                                                {tx.txHash}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
