'use client';

import { useState, useEffect, useCallback } from 'react';

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

const AGENTS_STORAGE_KEY = 'agentpay_agents';

// Generate a random wallet address
const generateWalletAddress = () => {
    return '0x' + Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
};

// Default agent for new users
const createDefaultAgent = (): Agent => ({
    id: `agent-${Date.now()}`,
    name: 'My First Agent',
    description: 'A versatile AI agent for various tasks',
    status: 'online',
    walletAddress: generateWalletAddress(),
    balance: 50.0,
    createdAt: new Date(),
    services: [
        {
            id: `svc-${Date.now()}-1`,
            name: 'Text Generation',
            description: 'Generate high-quality text content',
            pricePerRequest: 0.01,
            status: 'active',
            requests: 0,
            revenue: 0,
        },
    ],
    stats: {
        totalEarnings: 0,
        totalSpent: 0,
        servicesProvided: 0,
        servicesConsumed: 0,
        rating: 0,
        ratingCount: 0,
    },
});

export function useAgents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load agents from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem(AGENTS_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAgents(parsed.map((a: Agent) => ({
                    ...a,
                    createdAt: new Date(a.createdAt),
                })));
            } catch {
                // Create default agent if parsing fails
                const defaultAgent = createDefaultAgent();
                setAgents([defaultAgent]);
                localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify([defaultAgent]));
            }
        } else {
            // Create default agent for new users
            const defaultAgent = createDefaultAgent();
            setAgents([defaultAgent]);
            localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify([defaultAgent]));
        }
        setIsLoading(false);
    }, []);

    // Save agents to localStorage
    const saveAgents = useCallback((newAgents: Agent[]) => {
        setAgents(newAgents);
        localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(newAgents));
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
        toggleServiceStatus,
        recordServiceUsage,
    };
}
