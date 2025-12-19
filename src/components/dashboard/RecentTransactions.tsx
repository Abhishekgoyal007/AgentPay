'use client';

export function RecentTransactions() {
    const transactions = [
        {
            id: 'tx-001',
            type: 'incoming',
            service: 'Image Generation',
            from: 'Agent-7x2k',
            amount: 0.05,
            status: 'completed',
            time: '2 min ago',
        },
        {
            id: 'tx-002',
            type: 'outgoing',
            service: 'Data Analysis',
            to: 'Agent-m4n9',
            amount: 0.12,
            status: 'completed',
            time: '15 min ago',
        },
        {
            id: 'tx-003',
            type: 'incoming',
            service: 'Text Translation',
            from: 'Agent-p3q8',
            amount: 0.02,
            status: 'processing',
            time: '32 min ago',
        },
        {
            id: 'tx-004',
            type: 'incoming',
            service: 'Code Review',
            from: 'Agent-k9w2',
            amount: 0.08,
            status: 'completed',
            time: '1 hour ago',
        },
        {
            id: 'tx-005',
            type: 'outgoing',
            service: 'Audio Transcription',
            to: 'Agent-v5r1',
            amount: 0.03,
            status: 'completed',
            time: '2 hours ago',
        },
    ];

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <a href="/dashboard/transactions" className="text-sm text-[var(--accent-primary)] hover:underline">
                    View all
                </a>
            </div>

            <div className="space-y-4">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'incoming'
                                        ? 'bg-[var(--accent-success)]/10 text-[var(--accent-success)]'
                                        : 'bg-[var(--accent-warning)]/10 text-[var(--accent-warning)]'
                                    }`}
                            >
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

                            {/* Details */}
                            <div>
                                <div className="font-medium">{tx.service}</div>
                                <div className="text-sm text-[var(--text-tertiary)]">
                                    {tx.type === 'incoming' ? `From ${tx.from}` : `To ${tx.to}`}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div
                                className={`font-semibold mono-number ${tx.type === 'incoming' ? 'text-[var(--accent-success)]' : 'text-[var(--text-primary)]'
                                    }`}
                            >
                                {tx.type === 'incoming' ? '+' : '-'}{tx.amount} MOVE
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed'
                                            ? 'bg-[var(--accent-success)]'
                                            : tx.status === 'processing'
                                                ? 'bg-[var(--accent-warning)]'
                                                : 'bg-[var(--text-tertiary)]'
                                        }`}
                                />
                                <span className="text-sm text-[var(--text-tertiary)]">{tx.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
