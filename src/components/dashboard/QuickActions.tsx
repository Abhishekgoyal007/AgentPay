'use client';

import Link from 'next/link';

export function QuickActions() {
    const actions = [
        {
            label: 'Create Agent',
            description: 'Set up a new AI agent',
            href: '/dashboard/agents/new',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            color: 'var(--accent-primary)',
        },
        {
            label: 'Add Service',
            description: 'List a new service',
            href: '/dashboard/services/new',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
            ),
            color: 'var(--accent-tertiary)',
        },
        {
            label: 'Fund Wallet',
            description: 'Add MOVE tokens',
            href: '/dashboard/wallet',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'var(--accent-success)',
        },
        {
            label: 'Browse Marketplace',
            description: 'Find services',
            href: '/dashboard/marketplace',
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            color: 'var(--accent-warning)',
        },
    ];

    return (
        <div className="glass-card p-6 h-full">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>

            <div className="space-y-3">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all group"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${action.color}15`, color: action.color }}
                        >
                            {action.icon}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium group-hover:text-[var(--accent-primary)] transition-colors">
                                {action.label}
                            </div>
                            <div className="text-sm text-[var(--text-tertiary)]">{action.description}</div>
                        </div>
                        <svg
                            className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                ))}
            </div>
        </div>
    );
}
