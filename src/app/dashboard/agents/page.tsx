'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useAgents } from '@/hooks/useAgents';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

type ServiceCategory = 'text-generation' | 'image-generation' | 'translation' | 'code' | 'data' | 'custom';

const categoryOptions: { value: ServiceCategory; label: string; icon: string }[] = [
    { value: 'text-generation', label: 'Text Generation', icon: '📝' },
    { value: 'image-generation', label: 'Image Generation', icon: '🎨' },
    { value: 'translation', label: 'Translation', icon: '🌍' },
    { value: 'code', label: 'Code Analysis', icon: '💻' },
    { value: 'data', label: 'Data Processing', icon: '📊' },
    { value: 'custom', label: 'Custom', icon: '⚡' },
];

export default function AgentsPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const { agents, isLoading, createAgent, toggleServiceStatus, addService, removeService } = useAgents();
    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddServiceModal, setShowAddServiceModal] = useState<string | null>(null);

    // Create Agent form
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentDescription, setNewAgentDescription] = useState('');

    // Add Service form - Enhanced
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDescription, setNewServiceDescription] = useState('');
    const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>('text-generation');
    const [newServicePrice, setNewServicePrice] = useState('0.01');
    const [newServiceApiEndpoint, setNewServiceApiEndpoint] = useState('');
    const [listOnMarketplace, setListOnMarketplace] = useState(true);

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
        if (!newAgentName.trim()) return;
        createAgent(newAgentName, newAgentDescription);
        setShowCreateModal(false);
        setNewAgentName('');
        setNewAgentDescription('');
    };

    const handleAddService = () => {
        if (!showAddServiceModal || !newServiceName.trim()) return;

        addService(showAddServiceModal, {
            name: newServiceName,
            description: newServiceDescription,
            category: newServiceCategory,
            pricePerRequest: parseFloat(newServicePrice) || 0.01,
            apiEndpoint: newServiceApiEndpoint || undefined,
            listOnMarketplace: listOnMarketplace,
        });

        setShowAddServiceModal(null);
        resetServiceForm();
    };

    const resetServiceForm = () => {
        setNewServiceName('');
        setNewServiceDescription('');
        setNewServiceCategory('text-generation');
        setNewServicePrice('0.01');
        setNewServiceApiEndpoint('');
        setListOnMarketplace(true);
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
                                Create agents and list your services on the marketplace
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
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {agents.map((agent) => (
                                <div key={agent.id} className="glass-card p-6">
                                    {/* Agent Header */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-3xl">
                                            🤖
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-semibold">{agent.name}</h3>
                                                <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-[var(--accent-success)]' : 'bg-[var(--text-tertiary)]'}`} />
                                                <span className={`text-sm ${agent.status === 'online' ? 'text-[var(--accent-success)]' : 'text-[var(--text-tertiary)]'}`}>
                                                    {agent.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)]">{agent.description || 'No description'}</p>
                                            <div className="text-xs text-[var(--text-tertiary)] font-mono mt-1">
                                                {agent.walletAddress.slice(0, 10)}...{agent.walletAddress.slice(-8)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold gradient-text mono-number">{agent.balance.toFixed(2)}</div>
                                            <div className="text-xs text-[var(--text-tertiary)]">MOVE earned</div>
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
                                                {agent.stats.rating > 0 ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        {agent.stats.rating.toFixed(1)}
                                                    </>
                                                ) : (
                                                    <span className="text-[var(--text-tertiary)]">-</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-[var(--text-tertiary)]">Rating</div>
                                        </div>
                                        <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)]/50">
                                            <div className="text-lg font-bold mono-number text-[var(--accent-primary)]">
                                                {agent.services.length}
                                            </div>
                                            <div className="text-xs text-[var(--text-tertiary)]">Services</div>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-[var(--text-secondary)]">Services</h4>
                                            <button
                                                onClick={() => setShowAddServiceModal(agent.id)}
                                                className="text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Service
                                            </button>
                                        </div>

                                        {agent.services.length > 0 ? (
                                            <div className="space-y-2">
                                                {agent.services.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => toggleServiceStatus(agent.id, service.id)}
                                                                className={`w-3 h-3 rounded-full transition-colors ${service.status === 'active'
                                                                        ? 'bg-[var(--accent-success)]'
                                                                        : 'bg-[var(--text-tertiary)]'
                                                                    }`}
                                                                title={service.status === 'active' ? 'Click to pause' : 'Click to activate'}
                                                            />
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{service.name}</span>
                                                                    {service.listedOnMarketplace && (
                                                                        <span className="px-1.5 py-0.5 text-xs rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                                                                            Listed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-[var(--text-tertiary)]">
                                                                    {service.pricePerRequest} MOVE • {service.category}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right text-xs">
                                                                <div className="text-[var(--text-tertiary)]">{service.requests} reqs</div>
                                                                <div className="text-[var(--accent-success)] mono-number">{service.revenue.toFixed(2)} MOVE</div>
                                                            </div>
                                                            <button
                                                                onClick={() => removeService(agent.id, service.id)}
                                                                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--accent-error)] transition-colors"
                                                                title="Remove service"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-sm text-[var(--text-tertiary)]">
                                                No services yet. Add one to list on the marketplace!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Create New Agent Card */}
                            <div
                                onClick={() => setShowCreateModal(true)}
                                className="glass-card p-6 border-dashed border-2 border-[var(--border-secondary)] flex flex-col items-center justify-center min-h-[300px] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Create New Agent</h3>
                                <p className="text-sm text-[var(--text-tertiary)] text-center">
                                    Deploy a new AI agent and list services on the marketplace
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Agent Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="glass-card p-8 w-full max-w-md mx-4">
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
                                    Agent Name <span className="text-[var(--accent-error)]">*</span>
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="font-medium text-[var(--accent-primary)]">Embedded Wallet</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    A new wallet will be created automatically to receive payments.
                                </p>
                            </div>

                            <button
                                onClick={handleCreateAgent}
                                disabled={!newAgentName.trim()}
                                className="btn-primary w-full mt-4 disabled:opacity-50"
                            >
                                Create Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Service Modal - Enhanced */}
            {showAddServiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
                    <div className="glass-card p-8 w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Add Service</h2>
                            <button
                                onClick={() => { setShowAddServiceModal(null); resetServiceForm(); }}
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
                                    Service Name <span className="text-[var(--accent-error)]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                    placeholder="Text Generation API"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Category <span className="text-[var(--accent-error)]">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categoryOptions.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setNewServiceCategory(cat.value)}
                                            className={`p-3 rounded-xl text-center transition-all ${newServiceCategory === cat.value
                                                    ? 'bg-[var(--accent-primary)] text-white'
                                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                                                }`}
                                        >
                                            <div className="text-xl mb-1">{cat.icon}</div>
                                            <div className="text-xs">{cat.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newServiceDescription}
                                    onChange={(e) => setNewServiceDescription(e.target.value)}
                                    placeholder="Describe what your service does..."
                                    className="input-field min-h-[80px] resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Price per Request (MOVE) <span className="text-[var(--accent-error)]">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={newServicePrice}
                                    onChange={(e) => setNewServicePrice(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    API Endpoint (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={newServiceApiEndpoint}
                                    onChange={(e) => setNewServiceApiEndpoint(e.target.value)}
                                    placeholder="https://your-api.com/endpoint"
                                    className="input-field"
                                />
                                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                    Leave empty to use built-in mock AI responses for demo
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                <div>
                                    <div className="font-medium">List on Marketplace</div>
                                    <div className="text-sm text-[var(--text-tertiary)]">Allow others to use this service</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setListOnMarketplace(!listOnMarketplace)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${listOnMarketplace ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-card)]'
                                        }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${listOnMarketplace
                                            ? 'right-1 bg-white'
                                            : 'left-1 bg-[var(--text-tertiary)]'
                                        }`} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddService}
                                disabled={!newServiceName.trim()}
                                className="btn-primary w-full mt-4 disabled:opacity-50"
                            >
                                Add Service {listOnMarketplace && '& List on Marketplace'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
