'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, createContext, useContext } from 'react';

interface PrivyProviderProps {
    children: ReactNode;
}

// Demo mode context for when Privy isn't configured
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

export function PrivyProvider({ children }: PrivyProviderProps) {
    const [authenticated, setAuthenticated] = useState(false);
    const [queryClient] = useState(() => new QueryClient());

    const demoUser = authenticated ? {
        email: 'demo@agentpay.xyz',
        wallet: { address: '0x1234567890abcdef1234567890abcdef12345678' }
    } : null;

    // For now, always use demo mode until Privy is properly configured
    // To enable Privy, set NEXT_PUBLIC_PRIVY_APP_ID in .env.local
    console.log('🎮 Running in Demo Mode - Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable Privy');

    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    );
}
