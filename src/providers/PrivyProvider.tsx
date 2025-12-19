'use client';

import { PrivyProvider as PrivyAuthProvider, usePrivy } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, createContext, useContext, useEffect } from 'react';

interface PrivyWrapperProps {
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
    isDemoMode: false,
    demoUser: null,
    login: () => { },
    logout: () => { },
    authenticated: false,
    ready: true,
});

export const useDemoMode = () => useContext(DemoModeContext);

// The Privy App ID - check at runtime
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

// Inner component that uses Privy hooks
function PrivyIntegration({ children }: { children: ReactNode }) {
    const { login, logout, authenticated, ready, user } = usePrivy();

    const demoUser = authenticated && user ? {
        email: user.email?.address || 'user@agentpay.xyz',
        wallet: { address: user.wallet?.address || '0x' + '0'.repeat(40) }
    } : null;

    return (
        <DemoModeContext.Provider
            value={{
                isDemoMode: false,
                demoUser,
                login,
                logout,
                authenticated,
                ready,
            }}
        >
            {children}
        </DemoModeContext.Provider>
    );
}

// Demo mode fallback
function DemoModeProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);

    const demoUser = authenticated ? {
        email: 'demo@agentpay.xyz',
        wallet: { address: '0x1234567890abcdef1234567890abcdef12345678' }
    } : null;

    useEffect(() => {
        console.log('🎮 Running in Demo Mode - Privy App ID not found');
        console.log('NEXT_PUBLIC_PRIVY_APP_ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
    }, []);

    return (
        <DemoModeContext.Provider
            value={{
                isDemoMode: true,
                demoUser,
                login: () => setAuthenticated(true),
                logout: () => setAuthenticated(false),
                authenticated,
                ready: true,
            }}
        >
            {children}
        </DemoModeContext.Provider>
    );
}

export function PrivyProvider({ children }: PrivyWrapperProps) {
    const [queryClient] = useState(() => new QueryClient());

    // Debug log
    console.log('PrivyProvider init - PRIVY_APP_ID:', PRIVY_APP_ID);

    // Check if Privy is configured
    if (!PRIVY_APP_ID || PRIVY_APP_ID.length < 10) {
        return (
            <QueryClientProvider client={queryClient}>
                <DemoModeProvider>
                    {children}
                </DemoModeProvider>
            </QueryClientProvider>
        );
    }

    console.log('✅ Privy configured with App ID:', PRIVY_APP_ID);

    return (
        <QueryClientProvider client={queryClient}>
            <PrivyAuthProvider
                appId={PRIVY_APP_ID}
                config={{
                    appearance: {
                        theme: 'dark',
                        accentColor: '#8b5cf6',
                        showWalletLoginFirst: false,
                    },
                    loginMethods: ['email', 'wallet'],
                }}
            >
                <PrivyIntegration>
                    {children}
                </PrivyIntegration>
            </PrivyAuthProvider>
        </QueryClientProvider>
    );
}
