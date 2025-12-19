'use client';

import Link from 'next/link';

export function AgentCard() {
    // Mock agent data - will be replaced with real data later
    const agent = {
        id: 'agent-001',
        name: 'My First Agent',
        status: 'online' as const,
        walletAddress: '0x1234...5678',
        balance: 79.33,
        services: [
            { name: 'Image Generation', status: 'active', requests: 847, revenue: 42.35 },
            { name: 'Text Analysis', status: 'active', requests: 612, revenue: 30.60 },
            { name: 'Code Review', status: 'paused', requests: 388, revenue: 51.61 },
        ],
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Agent</h2>
                <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="text-sm text-[var(--accent-primary)] hover:underline"
                >
                    Manage
                </Link>
            </div>

            {/* Agent Header */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-2xl">
                    🤖
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <span className="status-dot status-online" />
                        <span className="text-sm text-[var(--accent-success)]">Online</span>
                    </div>
                    <div className="text-sm text-[var(--text-tertiary)] font-mono">{agent.walletAddress}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-[var(--text-tertiary)]">Balance</div>
                    <div className="text-xl font-bold mono-number gradient-text">{agent.balance} MOVE</div>
                </div>
            </div>

            {/* Services */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-[var(--text-secondary)]">Active Services</h4>
                    <Link
                        href="/dashboard/services/new"
                        className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Service
                    </Link>
                </div>

                <div className="space-y-3">
                    {agent.services.map((service, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`w-2 h-2 rounded-full ${service.status === 'active'
                                            ? 'bg-[var(--accent-success)]'
                                            : 'bg-[var(--text-tertiary)]'
                                        }`}
                                />
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
                                        {service.revenue} MOVE
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
