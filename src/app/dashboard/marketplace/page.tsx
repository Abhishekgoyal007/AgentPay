'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useMarketplace, MarketplaceService } from '@/hooks/useMarketplace';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

const categoryFilters = [
    { value: 'all', label: 'All Services' },
    { value: 'text-generation', label: '📝 Text' },
    { value: 'image-generation', label: '🎨 Image' },
    { value: 'translation', label: '🌍 Translation' },
    { value: 'code', label: '💻 Code' },
    { value: 'data', label: '📊 Data' },
    { value: 'custom', label: '⚡ Custom' },
];

export default function MarketplacePage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const { services, isLoading, getActiveServices } = useMarketplace();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');

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

    // Filter and sort services
    const filteredServices = getActiveServices()
        .filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.agentName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.requests - a.requests;
                case 'price-low':
                    return a.pricePerRequest - b.pricePerRequest;
                case 'price-high':
                    return b.pricePerRequest - a.pricePerRequest;
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

    if (!mounted || !demoMode.ready || !demoMode.authenticated) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
            <Sidebar />

            <main className="ml-64 min-h-screen">
                <DashboardHeader user={user} onLogout={demoMode.logout} />

                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Service <span className="gradient-text">Marketplace</span>
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Discover and use AI services from other agents. Pay per request with x402.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="glass-card p-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <svg
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search services, agents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field pl-12 w-full"
                                />
                            </div>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                className="input-field w-auto min-w-[150px]"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {categoryFilters.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value
                                            ? 'bg-[var(--accent-primary)] text-white'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-[var(--text-tertiary)]">
                            Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Services Grid */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="spinner" />
                        </div>
                    ) : filteredServices.length > 0 ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredServices.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No services found</h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                Try adjusting your search or filters
                            </p>
                            <Link href="/dashboard/agents" className="btn-primary inline-flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                List Your Own Service
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Service Card Component
function ServiceCard({ service }: { service: MarketplaceService }) {
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

    return (
        <Link
            href={`/dashboard/marketplace/${service.id}`}
            className="glass-card p-6 hover:border-[var(--accent-primary)]/50 transition-all group"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-2xl">
                    {getCategoryIcon(service.category)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg group-hover:text-[var(--accent-primary)] transition-colors truncate">
                        {service.name}
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)] truncate">
                        by {service.agentName}
                    </p>
                </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 min-h-[40px]">
                {service.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-secondary)]">
                <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {service.requests.toLocaleString()}
                    </span>
                    {service.rating > 0 && (
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {service.rating.toFixed(1)}
                        </span>
                    )}
                </div>
                <div className="text-right">
                    <div className="font-bold gradient-text mono-number">
                        {service.pricePerRequest} MOVE
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">per request</div>
                </div>
            </div>
        </Link>
    );
}
