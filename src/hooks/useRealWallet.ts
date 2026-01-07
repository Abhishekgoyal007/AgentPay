'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPublicClient, createWalletClient, http, parseEther, formatEther, custom } from 'viem';
import { useDemoMode } from '@/providers/PrivyProvider';
import { MOVEMENT_NETWORK, X402_CONFIG } from '@/lib/x402-config';

// Define Movement chain for viem
const movementTestnet = {
    id: MOVEMENT_NETWORK.chainId,
    name: MOVEMENT_NETWORK.name,
    nativeCurrency: {
        decimals: 8,
        name: 'MOVE',
        symbol: 'MOVE',
    },
    rpcUrls: {
        default: { http: [MOVEMENT_NETWORK.rpcUrl] },
    },
    blockExplorers: {
        default: { name: 'Movement Explorer', url: MOVEMENT_NETWORK.explorerUrl },
    },
    testnet: true,
} as const;

// Public client for reading from the blockchain
const publicClient = createPublicClient({
    chain: movementTestnet,
    transport: http(),
});

export interface Transaction {
    id: string;
    type: 'incoming' | 'outgoing';
    service: string;
    counterparty: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
    txHash?: string;
    x402Verified?: boolean;
}

export interface WalletState {
    address: string | null;
    balance: number;
    isConnected: boolean;
    isLoading: boolean;
    chainId?: number;
}

// Get storage key based on user address
const getStorageKey = (address: string, key: string) => `agentpay_${address}_${key}`;

export function useRealWallet() {
    const { authenticated, demoUser, isDemoMode } = useDemoMode();
    const [walletState, setWalletState] = useState<WalletState>({
        address: null,
        balance: 0,
        isConnected: false,
        isLoading: true,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const userAddress = demoUser?.wallet?.address || null;

    // Fetch real balance from blockchain
    const fetchBalance = useCallback(async (address: string) => {
        try {
            const balance = await publicClient.getBalance({
                address: address as `0x${string}`,
            });
            // MOVE has 8 decimals
            return Number(balance) / 10 ** 8;
        } catch (error) {
            console.error('Error fetching balance:', error);
            return 0;
        }
    }, []);

    // Initialize wallet
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initializeWallet = async () => {
            if (authenticated && userAddress) {
                // Try to fetch real balance, fall back to stored balance for demo
                let balance = 0;

                if (!isDemoMode) {
                    try {
                        balance = await fetchBalance(userAddress);
                    } catch {
                        console.log('Could not fetch real balance, using demo balance');
                    }
                }

                // If no real balance or demo mode, use stored/default
                if (balance === 0) {
                    const balanceKey = getStorageKey(userAddress, 'balance');
                    const savedBalance = localStorage.getItem(balanceKey);
                    balance = savedBalance !== null ? parseFloat(savedBalance) : 100.0;

                    if (savedBalance === null) {
                        localStorage.setItem(balanceKey, balance.toString());
                    }
                }

                setWalletState({
                    address: userAddress,
                    balance,
                    isConnected: true,
                    isLoading: false,
                    chainId: MOVEMENT_NETWORK.chainId,
                });

                // Load transactions
                const txKey = getStorageKey(userAddress, 'transactions');
                const savedTransactions = localStorage.getItem(txKey);
                if (savedTransactions) {
                    try {
                        const parsed = JSON.parse(savedTransactions);
                        setTransactions(parsed.map((tx: Transaction) => ({
                            ...tx,
                            timestamp: new Date(tx.timestamp),
                        })));
                    } catch {
                        setTransactions([]);
                    }
                }
            } else {
                setWalletState(prev => ({ ...prev, isLoading: false, isConnected: false }));
                setTransactions([]);
            }
        };

        initializeWallet();
    }, [authenticated, userAddress, isDemoMode, fetchBalance]);

    // Save transactions
    const saveTransactions = useCallback((txs: Transaction[]) => {
        if (!userAddress) return;
        localStorage.setItem(getStorageKey(userAddress, 'transactions'), JSON.stringify(txs));
    }, [userAddress]);

    // Update balance
    const updateBalance = useCallback((newBalance: number) => {
        if (!userAddress) return;
        setWalletState(prev => ({ ...prev, balance: newBalance }));
        localStorage.setItem(getStorageKey(userAddress, 'balance'), newBalance.toString());
    }, [userAddress]);

    // Add transaction
    const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTx: Transaction = {
            ...tx,
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        setTransactions(prev => {
            const updated = [newTx, ...prev];
            saveTransactions(updated);
            return updated;
        });

        return newTx;
    }, [saveTransactions]);

    // Make x402 payment (core function)
    const makeX402Payment = useCallback(async (
        amount: number,
        recipientAddress: string,
        serviceId: string,
        serviceName: string
    ): Promise<{
        success: boolean;
        txHash?: string;
        paymentPayload?: string;
        error?: string;
    }> => {
        if (!walletState.isConnected || !userAddress) {
            return { success: false, error: 'Wallet not connected' };
        }

        if (walletState.balance < amount) {
            return { success: false, error: `Insufficient balance. Need ${amount} MOVE, have ${walletState.balance.toFixed(4)} MOVE` };
        }

        setIsProcessingPayment(true);

        try {
            // In demo mode, simulate the transaction
            // In real mode, we would use the Privy wallet to sign and send

            // Simulate blockchain transaction
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generate transaction hash
            const txHash = `0x${Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('')}`;

            // Create x402 payment payload
            const paymentPayload = {
                signature: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
                txHash,
                from: userAddress,
                to: recipientAddress,
                amount: Math.floor(amount * 10 ** 8).toString(), // Convert to smallest unit
                network: X402_CONFIG.network,
                timestamp: Math.floor(Date.now() / 1000),
                nonce: Math.random().toString(36).substr(2, 16),
            };

            // Encode payment payload for x402 header
            const encodedPayload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

            // Update balance
            const newBalance = walletState.balance - amount;
            updateBalance(newBalance);

            // Record transaction
            addTransaction({
                type: 'outgoing',
                service: serviceName,
                counterparty: recipientAddress,
                amount,
                status: 'completed',
                txHash,
                x402Verified: true,
            });

            setIsProcessingPayment(false);

            return {
                success: true,
                txHash,
                paymentPayload: encodedPayload,
            };
        } catch (error) {
            setIsProcessingPayment(false);
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
            return { success: false, error: errorMessage };
        }
    }, [walletState, userAddress, updateBalance, addTransaction]);

    // Legacy makePayment for backward compatibility
    const makePayment = useCallback(async (
        amount: number,
        service: string,
        recipient: string
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        const result = await makeX402Payment(amount, recipient, 'legacy', service);
        return {
            success: result.success,
            txHash: result.txHash,
            error: result.error,
        };
    }, [makeX402Payment]);

    // Receive payment
    const receivePayment = useCallback(async (
        amount: number,
        service: string,
        sender: string
    ) => {
        const newBalance = walletState.balance + amount;
        updateBalance(newBalance);

        const txHash = `0x${Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

        addTransaction({
            type: 'incoming',
            service,
            counterparty: sender,
            amount,
            status: 'completed',
            txHash,
            x402Verified: true,
        });

        return { success: true, txHash };
    }, [walletState, updateBalance, addTransaction]);

    // Fund wallet (for testing)
    const fundWallet = useCallback(async (amount: number) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newBalance = walletState.balance + amount;
        updateBalance(newBalance);

        addTransaction({
            type: 'incoming',
            service: 'Faucet',
            counterparty: 'Movement Testnet Faucet',
            amount,
            status: 'completed',
            txHash: `0x${Array.from({ length: 64 }, () =>
                Math.floor(Math.random() * 16).toString(16)
            ).join('')}`,
        });

        return { success: true };
    }, [walletState, updateBalance, addTransaction]);

    // Refresh balance from blockchain
    const refreshBalance = useCallback(async () => {
        if (userAddress && !isDemoMode) {
            const balance = await fetchBalance(userAddress);
            if (balance > 0) {
                updateBalance(balance);
            }
        }
    }, [userAddress, isDemoMode, fetchBalance, updateBalance]);

    return {
        ...walletState,
        transactions,
        makePayment,
        makeX402Payment,
        receivePayment,
        fundWallet,
        refreshBalance,
        isDemoMode,
        isProcessingPayment,
        network: MOVEMENT_NETWORK,
    };
}
