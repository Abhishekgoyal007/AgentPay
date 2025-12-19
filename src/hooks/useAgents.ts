'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';

interface Service {
    id: string;
    name: string;
    description: string;
    pricePerRequest: number;
    status: 'active' | 'paused';
    requests: number;
    revenue: number;
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

// Generate a random wallet address for agent
const generateWalletAddress = () => {
    return '0x' + Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
};

export function useAgents() {
    const { authenticated, demoUser } = useDemoMode();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const userAddress = demoUser?.wallet?.address || null;

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
                // New user - start with empty agents
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
        const updated = agents.filter(a => a.id !== agentId);
        saveAgents(updated);
    }, [agents, saveAgents]);

    // Add service to agent
    const addService = useCallback((
        agentId: string,
        service: Omit<Service, 'id' | 'requests' | 'revenue'>
    ) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return null;

        const newService: Service = {
            ...service,
            id: `svc-${Date.now()}`,
            requests: 0,
            revenue: 0,
        };

        updateAgent(agentId, {
            services: [...agent.services, newService],
        });

        return newService;
    }, [agents, updateAgent]);

    // Remove service from agent
    const removeService = useCallback((agentId: string, serviceId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        updateAgent(agentId, {
            services: agent.services.filter(s => s.id !== serviceId),
        });
    }, [agents, updateAgent]);

    // Toggle service status
    const toggleServiceStatus = useCallback((agentId: string, serviceId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) return;

        const updatedServices = agent.services.map(s =>
            s.id === serviceId
                ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const }
                : s
        );

        updateAgent(agentId, { services: updatedServices });
    }, [agents, updateAgent]);

    // Record service usage (when agent provides a service)
    const recordServiceUsage = useCallback((
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
        recordServiceUsage,
    };
}
