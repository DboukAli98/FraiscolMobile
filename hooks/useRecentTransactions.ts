import {
    PaymentTransactionsSummary,
    RecentPaymentTransactionDto,
    useGetParentRecentTransactions
} from '@/services/userServices';
import { useCallback, useEffect, useState } from 'react';

export interface UseRecentTransactionsProps {
    parentId: number | null;
    timePeriod?: string;
    topCount?: number;
    autoFetch?: boolean;
}

export interface UseRecentTransactionsReturn {
    // Data
    transactions: RecentPaymentTransactionDto[];
    summary: PaymentTransactionsSummary | null;
    
    // Loading states
    isLoading: boolean;
    isRefreshing: boolean;
    
    // Error handling
    error: string | null;
    
    // Actions
    refresh: () => Promise<void>;
    retry: () => void;
    fetchTransactions: (period?: string) => Promise<void>;
}

export const useRecentTransactions = ({
    parentId,
    timePeriod = 'week',
    topCount = 5,
    autoFetch = true,
}: UseRecentTransactionsProps): UseRecentTransactionsReturn => {
    // Hooks
    const getParentRecentTransactions = useGetParentRecentTransactions();
    
    // State
    const [transactions, setTransactions] = useState<RecentPaymentTransactionDto[]>([]);
    const [summary, setSummary] = useState<PaymentTransactionsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch transactions data
    const fetchTransactions = useCallback(async (
        period: string = timePeriod,
        isRefresh: boolean = false
    ) => {
        if (!parentId || parentId <= 0) {
            setError('Valid Parent ID is required');
            return;
        }

        try {
            // Set appropriate loading state
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            
            setError(null);

            const response = await getParentRecentTransactions({
                parentId,
                timePeriod: period,
                topCount,
            });

            if (response.success && response.data) {
                setTransactions(response.data.data || []);
                setSummary(response.data.summary || null);
            } else {
                // Handle the case where there are no transactions (still success)
                if (response.data?.status === 'Success') {
                    setTransactions([]);
                    setSummary(response.data.summary || null);
                } else {
                    throw new Error(response.error || 'Failed to fetch recent transactions');
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred while fetching recent transactions';
            setError(errorMessage);
            console.error('Error fetching recent transactions:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [parentId, getParentRecentTransactions, topCount, timePeriod]);

    // Refresh data
    const refresh = useCallback(async () => {
        await fetchTransactions(timePeriod, true);
    }, [fetchTransactions, timePeriod]);

    // Retry function
    const retry = useCallback(() => {
        fetchTransactions(timePeriod, false);
    }, [fetchTransactions, timePeriod]);

    // Fetch transactions with different time period
    const fetchTransactionsWithPeriod = useCallback(async (period?: string) => {
        await fetchTransactions(period || timePeriod, false);
    }, [fetchTransactions, timePeriod]);

    // Initial data fetch
    useEffect(() => {
        if (autoFetch && parentId && parentId > 0) {
            fetchTransactions(timePeriod, false);
        }
    }, [parentId, autoFetch]); // Only run when parentId or autoFetch changes

    // Debug logging
    useEffect(() => {
        console.log('Recent transactions state:', {
            transactionsCount: transactions.length,
            isLoading,
            isRefreshing,
            error,
            parentId,
            summary,
        });
    }, [transactions.length, isLoading, isRefreshing, error, parentId, summary]);

    return {
        // Data
        transactions,
        summary,
        
        // Loading states
        isLoading,
        isRefreshing,
        
        // Error handling
        error,
        
        // Actions
        refresh,
        retry,
        fetchTransactions: fetchTransactionsWithPeriod,
    };
};