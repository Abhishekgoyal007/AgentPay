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

// Storage keys
const WALLET_STORAGE_KEY = 'agentpay_wallet';
const TRANSACTIONS_STORAGE_KEY = 'agentpay_transactions';
const WALLET_BALANCE_KEY = 'agentpay_balance';

export function useWallet() {
    const { authenticated, demoUser, isDemoMode } = useDemoMode();
    const [walletState, setWalletState] = useState<WalletState>({
        address: null,
        balance: 0,
        isConnected: false,
        isLoading: true,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Initialize wallet from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedBalance = localStorage.getItem(WALLET_BALANCE_KEY);
        const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

        if (authenticated && demoUser) {
            setWalletState({
                address: demoUser.wallet.address,
                balance: savedBalance ? parseFloat(savedBalance) : 100.0, // Start with 100 MOVE for demo
                isConnected: true,
                isLoading: false,
            });
        } else {
            setWalletState(prev => ({ ...prev, isLoading: false }));
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
    }, [authenticated, demoUser]);

    // Save balance to localStorage
    const updateBalance = useCallback((newBalance: number) => {
        setWalletState(prev => ({ ...prev, balance: newBalance }));
        localStorage.setItem(WALLET_BALANCE_KEY, newBalance.toString());
    }, []);

    // Add transaction
    const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
        const newTx: Transaction = {
            ...tx,
            id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        setTransactions(prev => {
            const updated = [newTx, ...prev];
            localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });

        return newTx;
    }, []);

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

    // Fund wallet (for demo)
    const fundWallet = useCallback(async (amount: number) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newBalance = walletState.balance + amount;
        updateBalance(newBalance);

        addTransaction({
            type: 'incoming',
            service: 'Faucet',
            counterparty: 'Movement Faucet',
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
