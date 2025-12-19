'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { useWallet } from '@/hooks/useWallet';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function SettingsPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const { balance } = useWallet();
    const [mounted, setMounted] = useState(false);

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

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid-pattern">
            <Sidebar />

            <main className="ml-64 min-h-screen">
                <DashboardHeader user={user} onLogout={demoMode.logout} />

                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="gradient-text">Settings</span>
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Manage your account and preferences
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Account Info */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-6">Account</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)] mb-1 block">Email</label>
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                        {user?.email?.address || 'Not set'}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)] mb-1 block">Wallet Address</label>
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] font-mono text-sm break-all">
                                        {user?.wallet?.address || 'Not connected'}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)] mb-1 block">Balance</label>
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                        <span className="font-bold gradient-text mono-number">{balance.toFixed(4)}</span>
                                        <span className="text-[var(--text-tertiary)] ml-2">MOVE</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Network Info */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-6">Network</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-[var(--accent-success)] animate-pulse" />
                                        <span className="font-medium">Movement Testnet</span>
                                    </div>
                                    <span className="badge badge-success">Connected</span>
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)] mb-1 block">RPC URL</label>
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] font-mono text-sm text-[var(--text-secondary)]">
                                        https://mevm.devnet.imola.movementlabs.xyz
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)] mb-1 block">Chain ID</label>
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] font-mono text-sm text-[var(--text-secondary)]">
                                        30732
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-6">Preferences</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                    <div>
                                        <div className="font-medium">Email Notifications</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Receive payment alerts</div>
                                    </div>
                                    <button className="relative w-12 h-6 bg-[var(--accent-primary)] rounded-full transition-colors">
                                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                    <div>
                                        <div className="font-medium">Auto-confirm Transactions</div>
                                        <div className="text-sm text-[var(--text-tertiary)]">Skip confirmation for small payments</div>
                                    </div>
                                    <button className="relative w-12 h-6 bg-[var(--bg-card)] rounded-full transition-colors">
                                        <span className="absolute left-1 top-1 w-4 h-4 bg-[var(--text-tertiary)] rounded-full transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="glass-card p-6 border border-[var(--accent-error)]/30">
                            <h2 className="text-xl font-semibold mb-6 text-[var(--accent-error)]">Danger Zone</h2>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                                            localStorage.clear();
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-full p-4 rounded-xl bg-[var(--accent-error)]/10 text-[var(--accent-error)] hover:bg-[var(--accent-error)]/20 transition-colors text-left"
                                >
                                    <div className="font-medium">Clear Local Data</div>
                                    <div className="text-sm opacity-70">Remove all agents, transactions, and settings</div>
                                </button>

                                <button
                                    onClick={demoMode.logout}
                                    className="w-full p-4 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-error)]/10 hover:text-[var(--accent-error)] transition-colors text-left"
                                >
                                    <div className="font-medium">Sign Out</div>
                                    <div className="text-sm text-[var(--text-tertiary)]">Log out of your account</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
