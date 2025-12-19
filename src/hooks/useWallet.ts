'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '@/providers/PrivyProvider';

interface WalletState {
    address: string | null;
    balance: number;
    isConnected: boolean;
    isLoading: boolean;
}

interface Transaction {
    id: string;
    type: 'incoming' | 'outgoing';
    service: string;
    counterparty: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    timestamp: Date;
    txHash?: string;
}

// Get storage key based on user address
const getStorageKey = (address: string, key: string) => `agentpay_${address}_${key}`;

export function useWallet() {
    const { authenticated, demoUser, isDemoMode } = useDemoMode();
    const [walletState, setWalletState] = useState<WalletState>({
        address: null,
        balance: 0,
        isConnected: false,
        isLoading: true,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const userAddress = demoUser?.wallet?.address || null;

    // Initialize wallet from localStorage (user-specific)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (authenticated && userAddress) {
            const balanceKey = getStorageKey(userAddress, 'balance');
            const txKey = getStorageKey(userAddress, 'transactions');

            const savedBalance = localStorage.getItem(balanceKey);
            const savedTransactions = localStorage.getItem(txKey);

            // New users start with 100 MOVE for demo purposes
            const initialBalance = savedBalance !== null ? parseFloat(savedBalance) : 100.0;

            setWalletState({
                address: userAddress,
                balance: initialBalance,
                isConnected: true,
                isLoading: false,
            });

            // Save initial balance if new user
            if (savedBalance === null) {
                localStorage.setItem(balanceKey, initialBalance.toString());
            }

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
    }, [authenticated, userAddress]);

    // Save balance to localStorage (user-specific)
    const updateBalance = useCallback((newBalance: number) => {
        if (!userAddress) return;
        setWalletState(prev => ({ ...prev, balance: newBalance }));
        localStorage.setItem(getStorageKey(userAddress, 'balance'), newBalance.toString());
    }, [userAddress]);

    // Save transactions to localStorage (user-specific)
    const saveTransactions = useCallback((txs: Transaction[]) => {
        if (!userAddress) return;
        localStorage.setItem(getStorageKey(userAddress, 'transactions'), JSON.stringify(txs));
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

    // Make payment
    const makePayment = useCallback(async (
        amount: number,
        service: string,
        recipient: string
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        if (!walletState.isConnected) {
            return { success: false, error: 'Wallet not connected' };
        }

        if (walletState.balance < amount) {
            return { success: false, error: 'Insufficient balance' };
        }

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock tx hash
        const txHash = `0x${Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;

        // Update balance
        const newBalance = walletState.balance - amount;
        updateBalance(newBalance);

        // Add transaction
        addTransaction({
            type: 'outgoing',
            service,
            counterparty: recipient,
            amount,
            status: 'completed',
            txHash,
        });

        return { success: true, txHash };
    }, [walletState, updateBalance, addTransaction]);

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

    return {
        ...walletState,
        transactions,
        makePayment,
        receivePayment,
        fundWallet,
        isDemoMode,
    };
}
