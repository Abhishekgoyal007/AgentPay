'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import Link from 'next/link';

// Mock agents data
const mockAgents = [
    {
        id: 'agent-001',
        name: 'My First Agent',
        description: 'A versatile AI agent for text and image generation',
        status: 'online' as const,
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        balance: 79.33,
        createdAt: '2024-12-01',
        services: 3,
        stats: {
            totalEarnings: 124.56,
            totalSpent: 45.23,
            servicesProvided: 1847,
            servicesConsumed: 423,
            rating: 4.8,
            ratingCount: 156,
        },
    },
];

export default function AgentsPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDescription, setNewAgentDescription] = useState('');

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

    const handleCreateAgent = () => {
        // In production, this would call the API
        console.log('Creating agent:', { name: newAgentName, description: newAgentDescription });
        setShowCreateModal(false);
        setNewAgentName('');
        setNewAgentDescription('');
    };

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
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                My <span className="gradient-text">Agents</span>
                            </h1>
                            <p className="text-[var(--text-secondary)]">
                                Manage your AI agents and their services
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Agent
                        </button>
                    </div>

                    {/* Agents Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {mockAgents.map((agent) => (
                            <div key={agent.id} className="glass-card p-6">
                                {/* Agent Header */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-3xl">
                                        🤖
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-semibold">{agent.name}</h3>
                                            <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-[var(--accent-success)]' : 'bg-[var(--text-tertiary)]'
                                                }`} />
                                            <span className={`text-sm ${agent.status === 'online' ? 'text-[var(--accent-success)]' : 'text-[var(--text-tertiary)]'
                                                }`}>
                                                {agent.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)]">{agent.description}</p>
                                        <div className="text-xs text-[var(--text-tertiary)] font-mono mt-1">
                                            {agent.walletAddress.slice(0, 10)}...{agent.walletAddress.slice(-8)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold gradient-text mono-number">{agent.balance}</div>
                                        <div className="text-xs text-[var(--text-tertiary)]">MOVE</div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                                        <div className="text-lg font-bold mono-number text-[var(--accent-success)]">
                                            {agent.stats.totalEarnings.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">Earned</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                                        <div className="text-lg font-bold mono-number">
                                            {agent.stats.servicesProvided}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">Served</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                                        <div className="text-lg font-bold mono-number flex items-center justify-center gap-1">
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {agent.stats.rating}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">Rating</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                                        <div className="text-lg font-bold mono-number text-[var(--accent-primary)]">
                                            {agent.services}
                                        </div>
                                        <div className="text-xs text-[var(--text-tertiary)]">Services</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link
                                        href={`/dashboard/agents/${agent.id}`}
                                        className="flex-1 btn-primary text-center"
                                    >
                                        Manage
                                    </Link>
                                    <button className="px-4 py-2 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / Create New */}
                        <div className="glass-card p-6 border-dashed border-2 border-[var(--border-secondary)] flex flex-col items-center justify-center min-h-[300px] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer"
                            onClick={() => setShowCreateModal(true)}>
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Create New Agent</h3>
                            <p className="text-sm text-[var(--text-tertiary)] text-center">
                                Deploy a new AI agent with its own wallet and services
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-card p-8 w-full max-w-md mx-4 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Create Agent</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Agent Name
                                </label>
                                <input
                                    type="text"
                                    value={newAgentName}
                                    onChange={(e) => setNewAgentName(e.target.value)}
                                    placeholder="My AI Agent"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newAgentDescription}
                                    onChange={(e) => setNewAgentDescription(e.target.value)}
                                    placeholder="What does this agent do?"
                                    className="input-field min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium text-[var(--accent-primary)]">Embedded Wallet</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    A new wallet will be automatically created for this agent using Privy.
                                </p>
                            </div>

                            <button
                                onClick={handleCreateAgent}
                                disabled={!newAgentName}
                                className="btn-primary w-full mt-4"
                            >
                                Create Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
