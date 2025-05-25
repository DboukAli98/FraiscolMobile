// hooks/useChildrenData.ts
import useUserInfo from '@/hooks/useUserInfo';
import { useGetParentChildrens } from '@/services/userServices';
import { useCallback, useEffect, useState } from 'react';

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
  
  // Get parent ID from user info
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId) : null;

  // Fetch children data
  const fetchChildren = useCallback(async (
    page: number = 1,
    search: string = searchQuery,
    isRefresh: boolean = false,
    isLoadMore: boolean = false
  ) => {
    if (!parentId) {
      setError('Parent ID not found');
      return;
    }

    try {
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
        }
        
        setTotalCount(response.data.totalCount);
        setCurrentPage(page);
        
        // Calculate if there's a next page
        const totalPages = Math.ceil(response.data.totalCount / pageSize);
        setHasNextPage(page < totalPages);
        
      } else {
        throw new Error(response.error || 'Failed to fetch children');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while fetching children';
      setError(errorMessage);
      console.error('Error fetching children:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [parentId, getParentChildrens, pageSize, searchQuery]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || isLoading) return;
    
    const nextPage = currentPage + 1;
    await fetchChildren(nextPage, searchQuery, false, true);
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, searchQuery, fetchChildren]);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchChildren(1, searchQuery, true, false);
  }, [searchQuery, fetchChildren]);

  // Search function with debouncing handled by the component
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset pagination and fetch new data
    fetchChildren(1, query, false, false);
  }, [fetchChildren]);

  // Retry function
  const retry = useCallback(() => {
    fetchChildren(1, searchQuery, false, false);
  }, [fetchChildren, searchQuery]);

  // Initial data fetch
  useEffect(() => {
    if (parentId) {
      fetchChildren(1, initialSearch);
    }
  }, [parentId]); // Only run when parentId changes

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
    });
  }, [children.length, isLoading, isLoadingMore, currentPage, hasNextPage, totalCount, error, parentId]);

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