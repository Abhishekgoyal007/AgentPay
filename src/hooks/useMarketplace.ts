'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';

// Enhanced Service type with API configuration
export interface MarketplaceService {
    id: string;
    name: string;
    description: string;
    category: 'text-generation' | 'image-generation' | 'translation' | 'code' | 'data' | 'custom';
    pricePerRequest: number;
    status: 'active' | 'paused';

    // API Configuration
    apiEndpoint?: string; // Optional - if not set, uses mock
    inputSchema: {
        field: string;
        type: 'string' | 'number' | 'boolean';
        required: boolean;
        description: string;
        placeholder?: string;
    }[];

    // Stats
    requests: number;
    revenue: number;
    rating: number;
    ratingCount: number;

    // Owner info
    agentId: string;
    agentName: string;
    ownerAddress: string;
    ownerWalletAddress: string;

    createdAt: Date;
}

// Global service registry key
const GLOBAL_SERVICES_KEY = 'agentpay_global_services';

export function useMarketplace() {
    const { authenticated, demoUser } = useDemoMode();
    const [services, setServices] = useState<MarketplaceService[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userAddress = demoUser?.wallet?.address || null;

    // Load all services from global registry
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadServices = () => {
            const saved = localStorage.getItem(GLOBAL_SERVICES_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setServices(parsed.map((s: MarketplaceService) => ({
                        ...s,
                        createdAt: new Date(s.createdAt),
                    })));
                } catch {
                    // Initialize with sample services
                    initializeSampleServices();
                }
            } else {
                initializeSampleServices();
            }
            setIsLoading(false);
        };

        loadServices();

        // Listen for updates from other tabs/components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === GLOBAL_SERVICES_KEY) {
                loadServices();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Also poll for changes (for same-tab updates)
        const interval = setInterval(loadServices, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Initialize with sample services for demo
    const initializeSampleServices = () => {
        const sampleServices: MarketplaceService[] = [
            {
                id: 'sample-gpt4',
                name: 'GPT-4 Text Generation',
                description: 'High-quality text generation powered by GPT-4. Perfect for content creation, summaries, and creative writing.',
                category: 'text-generation',
                pricePerRequest: 0.01,
                status: 'active',
                inputSchema: [
                    { field: 'prompt', type: 'string', required: true, description: 'Your text prompt', placeholder: 'Write a short story about...' }
                ],
                requests: 15420,
                revenue: 154.2,
                rating: 4.9,
                ratingCount: 1240,
                agentId: 'sample-agent-1',
                agentName: 'TextMaster AI',
                ownerAddress: 'sample@demo.xyz',
                ownerWalletAddress: '0xABC123DEF456ABC123DEF456ABC123DEF456ABC1',
                createdAt: new Date(),
            },
            {
                id: 'sample-sdxl',
                name: 'Image Generation (SDXL)',
                description: 'Create stunning images from text prompts using Stable Diffusion XL.',
                category: 'image-generation',
                pricePerRequest: 0.05,
                status: 'active',
                inputSchema: [
                    { field: 'prompt', type: 'string', required: true, description: 'Image description', placeholder: 'A futuristic city at sunset...' }
                ],
                requests: 8730,
                revenue: 436.5,
                rating: 4.8,
                ratingCount: 890,
                agentId: 'sample-agent-2',
                agentName: 'PixelForge',
                ownerAddress: 'pixelforge@demo.xyz',
                ownerWalletAddress: '0x123456789ABCDEF123456789ABCDEF12345678A',
                createdAt: new Date(),
            },
            {
                id: 'sample-translate',
                name: 'Real-time Translation',
                description: 'Translate text between 100+ languages with near-native quality.',
                category: 'translation',
                pricePerRequest: 0.002,
                status: 'active',
                inputSchema: [
                    { field: 'text', type: 'string', required: true, description: 'Text to translate', placeholder: 'Hello, how are you?' },
                    { field: 'target_lang', type: 'string', required: true, description: 'Target language code', placeholder: 'es' }
                ],
                requests: 42100,
                revenue: 84.2,
                rating: 4.7,
                ratingCount: 2100,
                agentId: 'sample-agent-3',
                agentName: 'LinguaBot',
                ownerAddress: 'linguabot@demo.xyz',
                ownerWalletAddress: '0x789012345678901234567890123456789012345B',
                createdAt: new Date(),
            },
        ];

        localStorage.setItem(GLOBAL_SERVICES_KEY, JSON.stringify(sampleServices));
        setServices(sampleServices);
    };

    // Save services to global registry
    const saveServices = useCallback((newServices: MarketplaceService[]) => {
        setServices(newServices);
        localStorage.setItem(GLOBAL_SERVICES_KEY, JSON.stringify(newServices));
    }, []);

    // Register a new service (from agent)
    const registerService = useCallback((service: Omit<MarketplaceService, 'id' | 'requests' | 'revenue' | 'rating' | 'ratingCount' | 'createdAt'>) => {
        const newService: MarketplaceService = {
            ...service,
            id: `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            requests: 0,
            revenue: 0,
            rating: 0,
            ratingCount: 0,
            createdAt: new Date(),
        };

        const updated = [...services, newService];
        saveServices(updated);
        return newService;
    }, [services, saveServices]);

    // Update service stats after use
    const recordServiceUsage = useCallback((serviceId: string, amount: number, rating?: number) => {
        const updated = services.map(s => {
            if (s.id === serviceId) {
                const newRatingCount = rating ? s.ratingCount + 1 : s.ratingCount;
                const newRating = rating
                    ? ((s.rating * s.ratingCount) + rating) / newRatingCount
                    : s.rating;

                return {
                    ...s,
                    requests: s.requests + 1,
                    revenue: s.revenue + amount,
                    rating: newRating,
                    ratingCount: newRatingCount,
                };
            }
            return s;
        });
        saveServices(updated);
    }, [services, saveServices]);

    // Remove service from marketplace
    const unregisterService = useCallback((serviceId: string) => {
        const updated = services.filter(s => s.id !== serviceId);
        saveServices(updated);
    }, [services, saveServices]);

    // Get services by owner
    const getMyServices = useCallback(() => {
        if (!userAddress) return [];
        return services.filter(s => s.ownerWalletAddress.toLowerCase() === userAddress.toLowerCase());
    }, [services, userAddress]);

    // Get services excluding my own (for marketplace browsing)
    const getOtherServices = useCallback(() => {
        if (!userAddress) return services.filter(s => s.status === 'active');
        return services.filter(s =>
            s.status === 'active' &&
            s.ownerWalletAddress.toLowerCase() !== userAddress.toLowerCase()
        );
    }, [services, userAddress]);

    // Get all active services
    const getActiveServices = useCallback(() => {
        return services.filter(s => s.status === 'active');
    }, [services]);

    return {
        services,
        isLoading,
        registerService,
        unregisterService,
        recordServiceUsage,
        getMyServices,
        getOtherServices,
        getActiveServices,
    };
}
