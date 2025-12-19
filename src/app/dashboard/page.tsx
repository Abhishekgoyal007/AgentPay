'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AgentCard } from '@/components/dashboard/AgentCard';

export default function DashboardPage() {
    const demoMode = useDemoMode();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Create a user-like object for the header
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
                    {/* Demo Mode Banner */}
                    {demoMode.isDemoMode && (
                        <div className="mb-6 p-4 rounded-xl bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/30">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[var(--accent-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <span className="text-[var(--accent-warning)] font-medium">Demo Mode</span>
                                    <span className="text-[var(--text-secondary)] ml-2">
                                        Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable wallet features
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, <span className="gradient-text">{user?.email?.address?.split('@')[0] || 'Agent'}</span>
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Here&apos;s what&apos;s happening with your agents today.
                        </p>
                    </div>

                    {/* Stats */}
                    <StatsCards />

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-6 mt-8">
                        {/* Agent Card */}
                        <div className="lg:col-span-2">
                            <AgentCard />
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <QuickActions />
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-8">
                        <RecentTransactions />
                    </div>
                </div>
            </main>
        </div>
    );
}
