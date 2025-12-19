'use client';

interface MarketplaceFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ai-generation', label: 'AI Generation' },
    { value: 'data-processing', label: 'Data Processing' },
    { value: 'translation', label: 'Translation' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'api-proxy', label: 'API Proxy' },
    { value: 'computation', label: 'Computation' },
    { value: 'storage', label: 'Storage' },
];

const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
];

export function MarketplaceFilters({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
}: MarketplaceFiltersProps) {
    return (
        <div className="glass-card p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search services..."
                            className="input-field pl-12"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="w-full lg:w-48">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <div className="w-full lg:w-48">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field cursor-pointer"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
                {categories.slice(1).map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value === selectedCategory ? 'all' : cat.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.value
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-white'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
