// hooks/usePaymentsData.ts

import useUserInfo from '@/hooks/useUserInfo';
import {
  GetParentInstallmentsParams,
  ParentInstallmentDto,
  useGetParentInstallments
} from '@/services/userServices';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UsePaymentsDataProps {
  pageSize?: number;
  filters?: {
    childId?: number;
    schoolId?: number;
    gradeSectionId?: number; // was schoolGradeSectionId
  };
}

export interface UsePaymentsDataReturn {
  // Data
  installments: ParentInstallmentDto[];
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  
  // Pagination
  hasNextPage: boolean;
  currentPage: number;
  totalCount: number;
  
  // Filters
  filters: {
    childId?: number;
    schoolId?: number;
    gradeSectionId?: number;
  };
  
  // Error handling
  error: string | null;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  applyFilters: (newFilters: UsePaymentsDataProps['filters']) => void;
  retry: () => void;
  
  // Summary data
  totalToPay: number;
  totalPaid: number;
  totalOverdue: number;
  paidCount: number;
  overdueCount: number;
}

export const usePaymentsData = ({
  pageSize = 10,
  filters: initialFilters = {},
}: UsePaymentsDataProps = {}): UsePaymentsDataReturn => {
  // Hooks
  const userInfo = useUserInfo();
  const getParentInstallments = useGetParentInstallments();
  
  // State
  const [installments, setInstallments] = useState<ParentInstallmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  // “did we ever successfully fetch page 1?” 
  // We won’t set this to true until we know page 1 came back cleanly.
  const [didFetchOnce, setDidFetchOnce] = useState(false);
  
  // Get parent ID (null until useUserInfo() rehydrates)
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId, 10) : null;

  //───────────────────────────────────────────────────────────────────────────
  // This helper actually calls the API. It tries up to 2 times if the first
  // call fails due to a (likely) cold-start or transient error.
  const fetchInstallmentsOnce = async (
    page: number,
    currentFilters: any
  ): Promise<{
    success: boolean;
    data?: ParentInstallmentDto[];
    totalCount?: number;
    errorMessage?: string;
  }> => {
    if (!parentId) {
      return { success: false, errorMessage: 'Parent ID not found' };
    }

    const params: GetParentInstallmentsParams = {
      parentId,
      pageNumber: page,
      pageSize,
      childId: currentFilters.childId,
      schoolId: currentFilters.schoolId,
      schoolGradeSectionId: currentFilters.gradeSectionId,
    };

    // We’ll try up to 2 attempts if the first attempt throws or returns status=Error.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await getParentInstallments(params);

        if (response.success && response.data) {
          return {
            success: true,
            data: response.data.data || [],
            totalCount: response.data.totalCount,
          };
        } else {
          // The server returned a 4xx/5xx or status=Error in JSON.
          const msg = response.error ?? 'Failed to fetch installments';
          if (attempt === 2) {
            return { success: false, errorMessage: msg };
          }
          // Otherwise, wait a tiny bit and retry
          await new Promise(res => setTimeout(res, 200));
          continue;
        }
      } catch (ex: any) {
        // Could be a cold-start connection failure (“Login failed…” or timeout).
        if (attempt === 2) {
          return { success: false, errorMessage: ex.message ?? 'Erreur interne' };
        }
        await new Promise(res => setTimeout(res, 200));
        continue;
      }
    }

    // In practice we’ll never reach here.
    return { success: false, errorMessage: 'Unknown error' };
  };

  //───────────────────────────────────────────────────────────────────────────
  // This is the internal function that your hook uses for page 1 (initial),
  // page N (load more), or page 1 again (refresh). It does not flip didFetchOnce
  // to true until we confirm a successful fetch.
  const fetchInstallmentsInternal = async (
    page: number = 1,
    currentFilters: any = {},
    isRefresh: boolean = false,
    isLoadMore: boolean = false
  ) => {
    console.log('Parent Id :::', parentId);
    if (!parentId) {
      setError('Parent ID not found');
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (isLoadMore) {
        setIsLoadingMore(true);
      } else if (page === 1) {
        setIsLoading(true);
      }
      setError(null);

      const result = await fetchInstallmentsOnce(page, currentFilters);
      if (!result.success) {
        // Don’t mark didFetchOnce = true; let the UI (or a manual retry) try again.
        setError(result.errorMessage ?? 'Échec de la récupération');
        return;
      }

      const newItems = result.data ?? [];
      const total = result.totalCount ?? 0;

      if (isRefresh || page === 1) {
        setInstallments(newItems);
        setCurrentPage(1);
      } else {
        setInstallments(prev => [...prev, ...newItems]);
        setCurrentPage(page);
      }

      setTotalCount(total);
      const totalPages = Math.ceil(total / pageSize);
      setHasNextPage(page < totalPages);

      // Only flip “didFetchOnce” if page === 1 AND we got data or zero-rows successfully
      if (page === 1) {
        setDidFetchOnce(true);
      }

      console.log('📊 Data loaded:', {
        newCount: newItems.length,
        totalCount: total,
        currentPage: page,
        hasNextPage: page < totalPages,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  //───────────────────────────────────────────────────────────────────────────
  // “Load more” simply calls page = currentPage + 1, if there is a next page
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || isLoading) {
      console.log('⚠️ Load more blocked:', {
        hasNextPage,
        isLoadingMore,
        isLoading,
      });
      return;
    }
    console.log('📄 Loading more data, next page:', currentPage + 1);
    const nextPage = currentPage + 1;
    await fetchInstallmentsInternal(nextPage, filters, false, true);
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, filters, parentId]);

  //───────────────────────────────────────────────────────────────────────────
  // “Pull to refresh” always tries page 1 again
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing data...');
    await fetchInstallmentsInternal(1, filters, true, false);
  }, [filters, parentId]);

  //───────────────────────────────────────────────────────────────────────────
  // When filters change, immediately fetch page 1
  const applyFilters = useCallback(
    (newFilters: UsePaymentsDataProps['filters']) => {
      const filtersToApply = newFilters || {};
      console.log('🔍 Applying filters:', filtersToApply);
      setFilters(filtersToApply);
      setCurrentPage(1);
      setDidFetchOnce(false); // allow the effect below to re-fire
      if (parentId) {
        fetchInstallmentsInternal(1, filtersToApply, false, false);
      }
    },
    [parentId]
  );

  //───────────────────────────────────────────────────────────────────────────
  // “Retry” simply calls page 1 again
  const retry = useCallback(() => {
    console.log('🔄 Retrying...');
    setDidFetchOnce(false); // allow the effect below to re-fire
    fetchInstallmentsInternal(1, filters, false, false);
  }, [filters, parentId]);

  //───────────────────────────────────────────────────────────────────────────
  // Initial load effect: only run once we have a valid parentId AND we have not
  // yet successfully fetched page 1. We do NOT flip `didFetchOnce = true` here;
  // we leave that to `fetchInstallmentsInternal` itself (but only if page 1 
  // returned without error).
useEffect(() => {
  if (parentId && !didFetchOnce) {
    fetchInstallmentsInternal(1, filters, false, false);
  }
}, [parentId, didFetchOnce, filters]);

  //───────────────────────────────────────────────────────────────────────────
  // Calculate summary data
  const summaryData = useMemo(() => {
    const now = new Date();
    const totalToPay = installments
      .filter(inst => !inst.isPaid)
      .reduce((sum, inst) => sum + inst.amount + (inst.lateFee ?? 0), 0);
    const totalPaid = installments
      .filter(inst => inst.isPaid)
      .reduce((sum, inst) => sum + inst.amount, 0);
    const overdueInstallments = installments.filter(
      inst => !inst.isPaid && new Date(inst.dueDate) < now
    );
    const totalOverdue = overdueInstallments.reduce(
      (sum, inst) => sum + inst.amount + (inst.lateFee ?? 0),
      0
    );
    const paidCount = installments.filter(inst => inst.isPaid).length;
    const overdueCount = overdueInstallments.length;

    return {
      totalToPay,
      totalPaid,
      totalOverdue,
      paidCount,
      overdueCount,
    };
  }, [installments]);

  return {
    // Data
    installments,

    // Loading states
    isLoading,
    isLoadingMore,
    isRefreshing,

    // Pagination
    hasNextPage,
    currentPage,
    totalCount,

    // Filters
    filters,

    // Error handling
    error,

    // Actions
    loadMore,
    refresh,
    applyFilters,
    retry,

    // Summary data
    ...summaryData,
  };
};
