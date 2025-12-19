'use client';

// Generic user type that works with both Privy and demo mode
interface UserType {
    email?: { address: string };
    wallet?: { address: string };
}

interface DashboardHeaderProps {
    user: UserType | null;
    onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
    const displayName = user?.email?.address?.split('@')[0] ||
        user?.wallet?.address?.slice(0, 6) + '...' + user?.wallet?.address?.slice(-4) ||
        'User';

    const walletAddress = user?.wallet?.address;

    return (
        <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-secondary)]">
            <div className="flex items-center justify-between px-8 h-16">
                {/* Search */}
                <div className="flex-1 max-w-md">
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
                            placeholder="Search agents, services, transactions..."
                            className="input-field pl-12 py-2.5 text-sm w-full"
                        />
                        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded border border-[var(--border-secondary)]">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent-primary)] rounded-full" />
                    </button>

                    {/* Wallet */}
                    {walletAddress && (
                        <div className="glass-card flex items-center gap-2 px-4 py-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-success)]" />
                            <span className="text-sm font-mono text-[var(--text-secondary)]">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </span>
                            <button className="text-[var(--text-tertiary)] hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-tertiary)] flex items-center justify-center text-white text-sm font-bold">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                            <div className="p-2">
                                <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                                    {displayName}
                                </div>
                                <hr className="border-[var(--border-secondary)] my-2" />
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--accent-error)] hover:bg-[var(--accent-error)]/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
