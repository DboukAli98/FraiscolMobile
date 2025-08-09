// hooks/useChildrenData.ts
import useUserInfo from '@/hooks/useUserInfo';
import { useGetParentChildrens } from '@/services/userServices';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseChildrenDataProps {
  pageSize?: number;
  initialSearch?: string;
}

interface Children {
  childId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  schoolName: string;
  schoolGradeName: string;
  fK_ParentId: number;
  fK_SchoolId: number;
  fK_StatusId: number;
  createdOn: string;
  modifiedOn: string | null;
}

export interface UseChildrenDataReturn {
  // Data
  children: Children[];
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  
  // Pagination
  hasNextPage: boolean;
  currentPage: number;
  totalCount: number;
  
  // Search
  searchQuery: string;
  
  // Error handling
  error: string | null;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  search: (query: string) => void;
  retry: () => void;
}

export const useChildrenData = ({
  pageSize = 10,
  initialSearch = '',
}: UseChildrenDataProps = {}): UseChildrenDataReturn => {
  // Hooks
  const userInfo = useUserInfo();
  const getParentChildrens = useGetParentChildrens();
  
  // State
  const [children, setChildren] = useState<Children[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  // Track initialization state to prevent multiple initial loads
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoadingRef = useRef(false); // Prevent concurrent requests
  const hasTriedInitialLoad = useRef(false); // Track if we've attempted initial load
  
  // Get parent ID from user info
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId) : null;

  // Internal fetch function with concurrency protection
  const fetchChildrenInternal = useCallback(async (
    page: number = 1,
    search: string = searchQuery,
    isRefresh: boolean = false,
    isLoadMore: boolean = false
  ) => {
    console.log('🚀 fetchChildrenInternal called:', {
      page,
      isRefresh,
      isLoadMore,
      isLoadingRef: isLoadingRef.current,
      parentId,
      search
    });

    // Prevent concurrent requests
    if (isLoadingRef.current) {
      console.log('⚠️ Children request blocked - already loading');
      return;
    }

    if (!parentId) {
      setError('Parent ID not found');
      return;
    }

    try {
      isLoadingRef.current = true;

      // Set appropriate loading state
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (isLoadMore) {
        setIsLoadingMore(true);
      } else if (page === 1) {
        setIsLoading(true);
      }
      
      setError(null);

      const response = await getParentChildrens({
        parentId,
        pageNumber: page,
        pageSize,
        search: search.trim(),
      });

      if (response.success && response.data) {
        const newChildren = response.data.data || [];
        
        if (isRefresh || page === 1) {
          // Replace data for refresh or first page
          setChildren(newChildren);
          setCurrentPage(1);
        } else {
          // Append data for load more
          setChildren(prev => [...prev, ...newChildren]);
          setCurrentPage(page);
        }
        
        setTotalCount(response.data.totalCount);
        
        // Calculate if there's a next page
        const totalPages = Math.ceil(response.data.totalCount / pageSize);
        setHasNextPage(page < totalPages);

        // Mark as initialized only on successful page 1 load
        if (page === 1) {
          setIsInitialized(true);
        }

        console.log('📊 Children data loaded:', {
          newCount: newChildren.length,
          totalCount: response.data.totalCount,
          currentPage: page,
          hasNextPage: page < totalPages,
        });
        
      } else {
        throw new Error(response.error || 'Impossible de récupérer les enfants');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Une erreur s'est produite lors de la récupération des enfants";
      setError(errorMessage);
      console.error('Error fetching children:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [parentId, getParentChildrens, pageSize, searchQuery]);

  // Load more data
  const loadMore = useCallback(async () => {
    // CRITICAL: Don't allow load more if page 1 was never loaded
    if (!isInitialized) {
      console.log('⚠️ Children load more blocked - page 1 never loaded, triggering initial load instead');
      if (!isLoadingRef.current && hasTriedInitialLoad.current === false) {
        hasTriedInitialLoad.current = true;
        await fetchChildrenInternal(1, searchQuery, false, false);
      }
      return;
    }

    if (!hasNextPage || isLoadingMore || isLoading || isLoadingRef.current) {
      console.log('⚠️ Children load more blocked:', {
        hasNextPage,
        isLoadingMore,
        isLoading,
        isLoadingRef: isLoadingRef.current,
      });
      return;
    }
    
    console.log('📄 Loading more children, next page:', currentPage + 1);
    const nextPage = currentPage + 1;
    await fetchChildrenInternal(nextPage, searchQuery, false, true);
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, searchQuery, isInitialized, fetchChildrenInternal]);

  // Refresh data
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing children data...');
    await fetchChildrenInternal(1, searchQuery, true, false);
  }, [searchQuery, fetchChildrenInternal]);

  // Search function
  const search = useCallback((query: string) => {
    console.log('🔍 Searching children:', query);
    setSearchQuery(query);
    setCurrentPage(1);
    setIsInitialized(false); // Reset initialization to allow re-fetch
    hasTriedInitialLoad.current = false; // Reset the attempt flag
    if (parentId) {
      fetchChildrenInternal(1, query, false, false);
    }
  }, [parentId, fetchChildrenInternal]);

  // Retry function
  const retry = useCallback(() => {
    console.log('🔄 Retrying children data...');
    setIsInitialized(false); // Reset initialization to allow re-fetch
    hasTriedInitialLoad.current = false; // Reset the attempt flag
    fetchChildrenInternal(1, searchQuery, false, false);
  }, [searchQuery, fetchChildrenInternal]);

  // Initial load effect - SINGLE POINT OF TRUTH
  useEffect(() => {
    console.log('🎯 Children useEffect triggered:', {
      parentId,
      isInitialized,
      hasTriedInitialLoad: hasTriedInitialLoad.current,
      isLoadingRef: isLoadingRef.current,
    });

    // Only load data once when:
    // 1. We have a parentId
    // 2. We haven't initialized yet
    // 3. We haven't tried loading yet
    // 4. We're not currently loading
    if (parentId && !isInitialized && !hasTriedInitialLoad.current && !isLoadingRef.current) {
      console.log('✅ Triggering initial children data load');
      hasTriedInitialLoad.current = true; // Mark that we've attempted
      fetchChildrenInternal(1, initialSearch, false, false);
    } else {
      console.log('⏭️ Skipping children initial load:', {
        hasParentId: !!parentId,
        isInitialized,
        hasTriedInitialLoad: hasTriedInitialLoad.current,
        isLoading: isLoadingRef.current,
      });
    }
  }, [parentId, isInitialized]);

  // Force initial load if we somehow have no data after a delay
  useEffect(() => {
    if (parentId && !isInitialized && !isLoadingRef.current) {
      const timer = setTimeout(() => {
        console.log('🔥 Force initial children load - ensuring page 1 loads');
        if (!isInitialized && !isLoadingRef.current) {
          hasTriedInitialLoad.current = true;
          fetchChildrenInternal(1, searchQuery, false, false);
        }
      }, 1000); // Wait 1 second then force load if still no data

      return () => clearTimeout(timer);
    }
  }, [parentId, isInitialized]);

  // Debug logging
  useEffect(() => {
    console.log('Children data state:', {
      childrenCount: children.length,
      isLoading,
      isLoadingMore,
      currentPage,
      hasNextPage,
      totalCount,
      error,
      parentId,
      isInitialized,
    });
  }, [children.length, isLoading, isLoadingMore, currentPage, hasNextPage, totalCount, error, parentId, isInitialized]);

  return {
    // Data
    children,
    
    // Loading states
    isLoading,
    isLoadingMore,
    isRefreshing,
    
    // Pagination
    hasNextPage,
    currentPage,
    totalCount,
    
    // Search
    searchQuery,
    
    // Error handling
    error,
    
    // Actions
    loadMore,
    refresh,
    search,
    retry,
  };
};