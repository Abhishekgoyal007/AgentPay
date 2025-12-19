'use client';

export function StatsCards() {
    const stats = [
        {
            label: 'Total Earnings',
            value: '124.56',
            unit: 'MOVE',
            change: '+12.5%',
            changeType: 'positive' as const,
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: 'Total Spent',
            value: '45.23',
            unit: 'MOVE',
            change: '-3.2%',
            changeType: 'positive' as const,
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            label: 'Services Provided',
            value: '1,847',
            unit: 'requests',
            change: '+28.4%',
            changeType: 'positive' as const,
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
        {
            label: 'Active Services',
            value: '3',
            unit: 'online',
            change: '',
            changeType: 'neutral' as const,
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            {stat.icon}
                        </div>
                        {stat.change && (
                            <span
                                className={`text-sm font-medium ${stat.changeType === 'positive'
                                        ? 'text-[var(--accent-success)]'
                                        : stat.changeType === 'negative'
                                            ? 'text-[var(--accent-error)]'
                                            : 'text-[var(--text-tertiary)]'
                                    }`}
                            >
                                {stat.change}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold mono-number">{stat.value}</span>
                            <span className="text-sm text-[var(--text-tertiary)]">{stat.unit}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
