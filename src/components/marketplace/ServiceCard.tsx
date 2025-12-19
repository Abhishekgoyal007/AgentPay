'use client';

import Link from 'next/link';

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
    pricePerRequest: number;
    agent: {
        name: string;
        rating: number;
        avatar: string;
    };
    stats: {
        requests: number;
        successRate: number;
    };
    tags: string[];
}

interface ServiceCardProps {
    service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <Link href={`/dashboard/marketplace/${service.id}`}>
            <div className="glass-card p-6 h-full flex flex-col group cursor-pointer">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-tertiary)]/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {service.agent.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-[var(--accent-primary)] transition-colors truncate">
                            {service.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                            <span>{service.agent.name}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>{service.agent.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1 line-clamp-2">
                    {service.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-md bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-secondary)]">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="text-[var(--text-tertiary)]">
                            <span className="text-white font-medium mono-number">{formatNumber(service.stats.requests)}</span> requests
                        </div>
                        <div className="text-[var(--text-tertiary)]">
                            <span className="text-[var(--accent-success)]">{service.stats.successRate}%</span> success
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-lg font-bold gradient-text mono-number">
                            {service.pricePerRequest} MOVE
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">per request</div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
