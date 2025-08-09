// hooks/usePaymentsData.ts

import useUserInfo from '@/hooks/useUserInfo';
import {
  GetParentInstallmentsParams,
  ParentInstallmentDto,
  useGetParentInstallments
} from '@/services/userServices';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  
  // Track initialization state to prevent multiple initial loads
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoadingRef = useRef(false); // Prevent concurrent requests
  const hasTriedInitialLoad = useRef(false); // Track if we've attempted initial load
  
  // Get parent ID (null until useUserInfo() rehydrates)
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId, 10) : null;

  // This helper actually calls the API with retry logic
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
          const msg = response.error ?? 'Failed to fetch installments';
          if (attempt === 2) {
            return { success: false, errorMessage: msg };
          }
          await new Promise(res => setTimeout(res, 300));
          continue;
        }
      } catch (ex: any) {
        if (attempt === 2) {
          return { success: false, errorMessage: ex.message ?? 'Erreur interne' };
        }
        await new Promise(res => setTimeout(res, 300));
        continue;
      }
    }

    return { success: false, errorMessage: 'Unknown error' };
  };

  // Internal fetch function with concurrency protection
  const fetchInstallmentsInternal = useCallback(async (
    page: number = 1,
    currentFilters: any = {},
    isRefresh: boolean = false,
    isLoadMore: boolean = false
  ) => {
    

    // Prevent concurrent requests
    if (isLoadingRef.current) {
      
      return;
    }

    if (!parentId) {
      setError('Parent ID not found');
      return;
    }

    try {
      isLoadingRef.current = true;

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

      // Mark as initialized only on successful page 1 load
      if (page === 1) {
        setIsInitialized(true);
      }

      
    } catch (error: any) {
      console.error('💥 fetchInstallmentsInternal error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [parentId, getParentInstallments, pageSize]);

  // Load more data
  const loadMore = useCallback(async () => {
    // CRITICAL: Don't allow load more if page 1 was never loaded
    if (!isInitialized) {
     
      if (!isLoadingRef.current && hasTriedInitialLoad.current === false) {
        hasTriedInitialLoad.current = true;
        await fetchInstallmentsInternal(1, filters, false, false);
      }
      return;
    }

    if (!hasNextPage || isLoadingMore || isLoading || isLoadingRef.current) {
     
      return;
    }
   
    const nextPage = currentPage + 1;
    await fetchInstallmentsInternal(nextPage, filters, false, true);
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, filters, isInitialized, fetchInstallmentsInternal]);

  // Pull to refresh
  const refresh = useCallback(async () => {
   
    await fetchInstallmentsInternal(1, filters, true, false);
  }, [filters, fetchInstallmentsInternal]);

  // Apply filters
  const applyFilters = useCallback(
    (newFilters: UsePaymentsDataProps['filters']) => {
      const filtersToApply = newFilters || {};
      console.log('🔍 Applying filters:', filtersToApply);
      setFilters(filtersToApply);
      setCurrentPage(1);
      setIsInitialized(false); // Reset initialization to allow re-fetch
      hasTriedInitialLoad.current = false; // Reset the attempt flag
      if (parentId) {
        fetchInstallmentsInternal(1, filtersToApply, false, false);
      }
    },
    [parentId, fetchInstallmentsInternal]
  );

  // Retry function
  const retry = useCallback(() => {
  
    setIsInitialized(false); // Reset initialization to allow re-fetch
    hasTriedInitialLoad.current = false; // Reset the attempt flag
    fetchInstallmentsInternal(1, filters, false, false);
  }, [filters, fetchInstallmentsInternal]);

  // Initial load effect - SINGLE POINT OF TRUTH
  useEffect(() => {
    

    // Only load data once when:
    // 1. We have a parentId
    // 2. We haven't initialized yet
    // 3. We haven't tried loading yet
    // 4. We're not currently loading
    if (parentId && !isInitialized && !hasTriedInitialLoad.current && !isLoadingRef.current) {
    
      hasTriedInitialLoad.current = true; // Mark that we've attempted
      fetchInstallmentsInternal(1, filters, false, false);
    } 
  }, [parentId, isInitialized]);

  // Force initial load if we somehow have no data after a delay
  useEffect(() => {
    if (parentId && !isInitialized && !isLoadingRef.current) {
      const timer = setTimeout(() => {
        
        if (!isInitialized && !isLoadingRef.current) {
          hasTriedInitialLoad.current = true;
          fetchInstallmentsInternal(1, filters, false, false);
        }
      }, 1000); // Wait 1 second then force load if still no data

      return () => clearTimeout(timer);
    }
  }, [parentId, isInitialized]); // REMOVED fetchInstallmentsInternal and filters from dependencies

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