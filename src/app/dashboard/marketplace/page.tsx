'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ServiceCard } from '@/components/marketplace/ServiceCard';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';

// Mock marketplace data
const mockServices = [
    {
        id: 'svc-001',
        name: 'GPT-4 Text Generation',
        description: 'High-quality text generation powered by GPT-4. Perfect for content creation, summaries, and creative writing.',
        category: 'ai-generation',
        pricePerRequest: 0.01,
        agent: { name: 'TextMaster AI', rating: 4.9, avatar: '🤖' },
        stats: { requests: 15420, successRate: 99.8 },
        tags: ['AI', 'Writing', 'GPT-4'],
    },
    {
        id: 'svc-002',
        name: 'Image Generation (SDXL)',
        description: 'Create stunning images from text prompts using Stable Diffusion XL. High resolution, fast generation.',
        category: 'ai-generation',
        pricePerRequest: 0.05,
        agent: { name: 'PixelForge', rating: 4.8, avatar: '🎨' },
        stats: { requests: 8730, successRate: 99.5 },
        tags: ['AI', 'Images', 'SDXL'],
    },
    {
        id: 'svc-003',
        name: 'Real-time Translation',
        description: 'Translate text between 100+ languages with near-native quality. Supports context-aware translations.',
        category: 'translation',
        pricePerRequest: 0.002,
        agent: { name: 'LinguaBot', rating: 4.7, avatar: '🌍' },
        stats: { requests: 42100, successRate: 99.9 },
        tags: ['Translation', 'Languages', 'NLP'],
    },
    {
        id: 'svc-004',
        name: 'Code Review & Analysis',
        description: 'Automated code review with security analysis, best practices suggestions, and performance tips.',
        category: 'analysis',
        pricePerRequest: 0.03,
        agent: { name: 'CodeSentry', rating: 4.9, avatar: '🔍' },
        stats: { requests: 5240, successRate: 99.6 },
        tags: ['Code', 'Security', 'Review'],
    },
    {
        id: 'svc-005',
        name: 'Data Extraction API',
        description: 'Extract structured data from websites, PDFs, and documents. Returns clean JSON output.',
        category: 'data-processing',
        pricePerRequest: 0.008,
        agent: { name: 'DataMiner', rating: 4.6, avatar: '⛏️' },
        stats: { requests: 28900, successRate: 98.7 },
        tags: ['Data', 'Scraping', 'ETL'],
    },
    {
        id: 'svc-006',
        name: 'Audio Transcription',
        description: 'Convert audio files to text with speaker diarization and timestamp support. Supports 50+ languages.',
        category: 'data-processing',
        pricePerRequest: 0.02,
        agent: { name: 'TranscribeAI', rating: 4.8, avatar: '🎙️' },
        stats: { requests: 11200, successRate: 99.2 },
        tags: ['Audio', 'Transcription', 'Speech'],
    },
];

export default function MarketplacePage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular');

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

    // Filter services
    const filteredServices = mockServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Sort services
    const sortedServices = [...filteredServices].sort((a, b) => {
        if (sortBy === 'popular') return b.stats.requests - a.stats.requests;
        if (sortBy === 'price-low') return a.pricePerRequest - b.pricePerRequest;
        if (sortBy === 'price-high') return b.pricePerRequest - a.pricePerRequest;
        if (sortBy === 'rating') return b.agent.rating - a.agent.rating;
        return 0;
    });

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

                    {/* Filters */}
                    <MarketplaceFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />

                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[var(--text-secondary)]">
                            Showing <span className="text-white font-medium">{sortedServices.length}</span> services
                        </p>
                    </div>

                    {/* Services Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedServices.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {sortedServices.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No services found</h3>
                            <p className="text-[var(--text-secondary)]">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
