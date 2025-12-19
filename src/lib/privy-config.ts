// Movement Network Testnet Configuration
export const MOVEMENT_TESTNET = {
  id: 30732, // Movement Bardock Testnet
  name: 'Movement Bardock Testnet',
  network: 'movement-bardock',
  nativeCurrency: {
    decimals: 8,
    name: 'MOVE',
    symbol: 'MOVE',
  },
  rpcUrls: {
    public: { http: ['https://mevm.devnet.imola.movementlabs.xyz'] },
    default: { http: ['https://mevm.devnet.imola.movementlabs.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Movement Explorer', url: 'https://explorer.movementnetwork.xyz' },
  },
  testnet: true,
} as const;

// Privy configuration for AgentPay (used when Privy is enabled)
export const privyConfig = {
  // Appearance
  appearance: {
    theme: 'dark' as const,
    accentColor: '#8b5cf6',
    showWalletLoginFirst: false,
  },
  // Login methods
  loginMethods: ['email', 'google', 'twitter', 'wallet'] as const,
  // Default chain for embedded wallets
  defaultChain: MOVEMENT_TESTNET,
  // Supported chains
  supportedChains: [MOVEMENT_TESTNET],
};

// App ID should be in environment variable
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id';
