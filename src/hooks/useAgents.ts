'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';

// Service input field definition
interface ServiceInputField {
    field: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    description: string;
    placeholder?: string;
}

interface Service {
    id: string;
    name: string;
    description: string;
    category: 'text-generation' | 'image-generation' | 'translation' | 'code' | 'data' | 'custom';
    pricePerRequest: number;
    status: 'active' | 'paused';
    apiEndpoint?: string; // Optional custom endpoint
    inputSchema: ServiceInputField[];
    requests: number;
    revenue: number;
    // If true, this service is listed on the global marketplace
    listedOnMarketplace: boolean;
    marketplaceServiceId?: string;
}

interface Agent {
    id: string;
    name: string;
    description: string;
    status: 'online' | 'offline';
    walletAddress: string;
    balance: number;
    createdAt: Date;
    services: Service[];
    stats: {
        totalEarnings: number;
        totalSpent: number;
        servicesProvided: number;
        servicesConsumed: number;
        rating: number;
        ratingCount: number;
    };
}

// Get storage key based on user address
const getStorageKey = (address: string) => `agentpay_${address}_agents`;
const GLOBAL_SERVICES_KEY = 'agentpay_global_services';

// Generate a random wallet address for agent
const generateWalletAddress = () => {
    return '0x' + Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
};

// Default input schemas for different service types
const getDefaultInputSchema = (category: string): ServiceInputField[] => {
    switch (category) {
        case 'text-generation':
            return [
                { field: 'prompt', type: 'string', required: true, description: 'Your text prompt', placeholder: 'Write about...' }
            ];
        case 'image-generation':
            return [
                { field: 'prompt', type: 'string', required: true, description: 'Image description', placeholder: 'A beautiful...' }
            ];
        case 'translation':
            return [
                { field: 'text', type: 'string', required: true, description: 'Text to translate', placeholder: 'Hello world' },
                { field: 'target_lang', type: 'string', required: true, description: 'Target language', placeholder: 'es' }
            ];
        case 'code':
            return [
                { field: 'code', type: 'string', required: true, description: 'Code to analyze', placeholder: 'function...' }
            ];
        case 'data':
            return [
                { field: 'url', type: 'string', required: true, description: 'URL or data source', placeholder: 'https://...' }
            ];
        default:
            return [
                { field: 'input', type: 'string', required: true, description: 'Input data', placeholder: 'Enter input...' }
            ];
    }
};

export function useAgents() {
    const { authenticated, demoUser } = useDemoMode();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userAddress = demoUser?.wallet?.address || null;
    const userEmail = demoUser?.email || null;

    // Load agents from localStorage (user-specific)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (authenticated && userAddress) {
            const storageKey = getStorageKey(userAddress);
            const saved = localStorage.getItem(storageKey);

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setAgents(parsed.map((a: Agent) => ({
                        ...a,
                        createdAt: new Date(a.createdAt),
                    })));
                } catch {
                    setAgents([]);
                }
            } else {
                setAgents([]);
            }
        } else {
            setAgents([]);
        }
        setIsLoading(false);
    }, [authenticated, userAddress]);

    // Save agents to localStorage (user-specific)
    const saveAgents = useCallback((newAgents: Agent[]) => {
        if (!userAddress) return;
        setAgents(newAgents);
        localStorage.setItem(getStorageKey(userAddress), JSON.stringify(newAgents));
    }, [userAddress]);

    // Sync service to global marketplace
    const syncToMarketplace = useCallback((agent: Agent, service: Service) => {
        if (!userAddress || !userEmail) return null;

        const globalServices = JSON.parse(localStorage.getItem(GLOBAL_SERVICES_KEY) || '[]');

        const marketplaceService = {
            id: service.marketplaceServiceId || `svc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: service.name,
            description: service.description,
            category: service.category,
            pricePerRequest: service.pricePerRequest,
            status: service.status,
            apiEndpoint: service.apiEndpoint,
            inputSchema: service.inputSchema,
            requests: service.requests,
            revenue: service.revenue,
            rating: 0,
            ratingCount: 0,
            agentId: agent.id,
            agentName: agent.name,
            ownerAddress: userEmail,
            ownerWalletAddress: userAddress,
            createdAt: new Date(),
        };

        // Check if already exists
        const existingIndex = globalServices.findIndex((s: { id: string }) => s.id === service.marketplaceServiceId);
        if (existingIndex >= 0) {
            globalServices[existingIndex] = marketplaceService;
        } else {
            globalServices.push(marketplaceService);
        }

        localStorage.setItem(GLOBAL_SERVICES_KEY, JSON.stringify(globalServices));
        return marketplaceService.id;
    }, [userAddress, userEmail]);

    // Remove service from global marketplace
    const removeFromMarketplace = useCallback((marketplaceServiceId: string) => {
        const globalServices = JSON.parse(localStorage.getItem(GLOBAL_SERVICES_KEY) || '[]');
        const filtered = globalServices.filter((s: { id: string }) => s.id !== marketplaceServiceId);
        localStorage.setItem(GLOBAL_SERVICES_KEY, JSON.stringify(filtered));
    }, []);

    // Create new agent
    const createAgent = useCallback((name: string, description: string) => {
        const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            name,
            description,
            status: 'online',
            walletAddress: generateWalletAddress(),
            balance: 0,
            createdAt: new Date(),
            services: [],
            stats: {
                totalEarnings: 0,
                totalSpent: 0,
                servicesProvided: 0,
                servicesConsumed: 0,
                rating: 0,
                ratingCount: 0,
            },
        };

        saveAgents([...agents, newAgent]);
        return newAgent;
    }, [agents, saveAgents]);

    // Update agent
    const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
        const updated = agents.map(a =>
            a.id === agentId ? { ...a, ...updates } : a
        );
        saveAgents(updated);
    }, [agents, saveAgents]);

    // Delete agent
    const deleteAgent = useCallback((agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            // Remove all services from marketplace
            agent.services.forEach(s => {
                if (s.marketplaceServiceId) {
                    removeFromMarketplace(s.marketplaceServiceId);
                }
            });
        }
        const updated = agents.filter(a => a.id !== agentId);
        saveAgents(updated);
    }, [agents, saveAgents, removeFromMarketplace]);

    // Add service to agent with full configuration
    const addService = useCallback((
        agentId: string,
        serviceData: {
            name: string;
            description: string;
            category: 'text-generation' | 'image-generation' | 'translation' | 'code' | 'data' | 'custom';
            pricePerRequest: number;
            apiEndpoint?: string;
            inputSchema?: ServiceInputField[];
            listOnMarketplace?: boolean;
        }
    ) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return null;

        const newService: Service = {
            id: `svc-${Date.now()}`,
            name: serviceData.name,
            description: serviceData.description,
            category: serviceData.category,
            pricePerRequest: serviceData.pricePerRequest,
            status: 'active',
            apiEndpoint: serviceData.apiEndpoint,
            inputSchema: serviceData.inputSchema || getDefaultInputSchema(serviceData.category),
            requests: 0,
            revenue: 0,
            listedOnMarketplace: serviceData.listOnMarketplace ?? true,
            marketplaceServiceId: undefined,
        };

        // If listing on marketplace, sync it
        if (newService.listedOnMarketplace) {
            newService.marketplaceServiceId = syncToMarketplace(agent, newService) || undefined;
        }

        updateAgent(agentId, {
            services: [...agent.services, newService],
        });

        return newService;
    }, [agents, updateAgent, syncToMarketplace]);

    // Remove service from agent
    const removeService = useCallback((agentId: string, serviceId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        const service = agent.services.find(s => s.id === serviceId);
        if (service?.marketplaceServiceId) {
            removeFromMarketplace(service.marketplaceServiceId);
        }

        updateAgent(agentId, {
            services: agent.services.filter(s => s.id !== serviceId),
        });
    }, [agents, updateAgent, removeFromMarketplace]);

    // Toggle service status
    const toggleServiceStatus = useCallback((agentId: string, serviceId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        const updatedServices = agent.services.map(s => {
            if (s.id === serviceId) {
                const newStatus = s.status === 'active' ? 'paused' : 'active';
                const updatedService = { ...s, status: newStatus as 'active' | 'paused' };

                // Update marketplace status too
                if (s.marketplaceServiceId) {
                    const globalServices = JSON.parse(localStorage.getItem(GLOBAL_SERVICES_KEY) || '[]');
                    const serviceIndex = globalServices.findIndex((gs: { id: string }) => gs.id === s.marketplaceServiceId);
                    if (serviceIndex >= 0) {
                        globalServices[serviceIndex].status = newStatus;
                        localStorage.setItem(GLOBAL_SERVICES_KEY, JSON.stringify(globalServices));
                    }
                }

                return updatedService;
            }
            return s;
        });

        updateAgent(agentId, { services: updatedServices });
    }, [agents, updateAgent]);

    // Record payment received (when someone uses our service)
    const recordEarning = useCallback((
        agentId: string,
        serviceId: string,
        amount: number
    ) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        const updatedServices = agent.services.map(s =>
            s.id === serviceId
                ? { ...s, requests: s.requests + 1, revenue: s.revenue + amount }
                : s
        );

        updateAgent(agentId, {
            services: updatedServices,
            balance: agent.balance + amount,
            stats: {
                ...agent.stats,
                totalEarnings: agent.stats.totalEarnings + amount,
                servicesProvided: agent.stats.servicesProvided + 1,
            },
        });

        // Update global marketplace stats
        const service = agent.services.find(s => s.id === serviceId);
        if (service?.marketplaceServiceId) {
            const globalServices = JSON.parse(localStorage.getItem(GLOBAL_SERVICES_KEY) || '[]');
            const serviceIndex = globalServices.findIndex((gs: { id: string }) => gs.id === service.marketplaceServiceId);
            if (serviceIndex >= 0) {
                globalServices[serviceIndex].requests += 1;
                globalServices[serviceIndex].revenue += amount;
                localStorage.setItem(GLOBAL_SERVICES_KEY, JSON.stringify(globalServices));
            }
        }
    }, [agents, updateAgent]);

    return {
        agents,
        isLoading,
        createAgent,
        updateAgent,
        deleteAgent,
        addService,
        removeService,
        toggleServiceStatus,
        recordEarning,
        getDefaultInputSchema,
    };
}
