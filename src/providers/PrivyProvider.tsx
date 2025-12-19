'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, createContext, useContext, useEffect } from 'react';

interface PrivyProviderProps {
    children: ReactNode;
}

// Demo mode context
interface DemoModeContextType {
    isDemoMode: boolean;
    demoUser: {
        email: string;
        wallet: { address: string };
    } | null;
    login: () => void;
    logout: () => void;
    authenticated: boolean;
    ready: boolean;
}

const DemoModeContext = createContext<DemoModeContextType>({
    isDemoMode: true,
    demoUser: null,
    login: () => { },
    logout: () => { },
    authenticated: false,
    ready: true,
});

export const useDemoMode = () => useContext(DemoModeContext);

// Check if Privy is configured
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const isPrivyConfigured = PRIVY_APP_ID && PRIVY_APP_ID !== 'your-privy-app-id' && PRIVY_APP_ID.startsWith('cl');

// Dynamic Privy import wrapper
function PrivyWrapper({ children }: { children: ReactNode }) {
    const [PrivyProvider, setPrivyProvider] = useState<React.ComponentType<{ appId: string; children: ReactNode }> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isPrivyConfigured) {
            import('@privy-io/react-auth').then((mod) => {
                setPrivyProvider(() => mod.PrivyProvider);
                setLoading(false);
            }).catch(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (PrivyProvider && isPrivyConfigured && PRIVY_APP_ID) {
        return <PrivyProvider appId={PRIVY_APP_ID}>{children}</PrivyProvider>;
    }

    return <>{children}</>;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
    const [authenticated, setAuthenticated] = useState(false);
    const [queryClient] = useState(() => new QueryClient());

    const demoUser = authenticated ? {
        email: 'demo@agentpay.xyz',
        wallet: { address: '0x1234567890abcdef1234567890abcdef12345678' }
    } : null;

    // Log demo mode status once on mount
    useEffect(() => {
        if (!isPrivyConfigured) {
            console.log('🎮 Running in Demo Mode - Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable Privy');
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <DemoModeContext.Provider
                value={{
                    isDemoMode: !isPrivyConfigured,
                    demoUser,
                    login: () => setAuthenticated(true),
                    logout: () => setAuthenticated(false),
                    authenticated,
                    ready: true,
                }}
            >
                {isPrivyConfigured ? (
                    <PrivyWrapper>{children}</PrivyWrapper>
                ) : (
                    children
                )}
            </DemoModeContext.Provider>
        </QueryClientProvider>
    );
}
