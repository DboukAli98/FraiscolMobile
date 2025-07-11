// hooks/useSchoolsData.ts
import useUserInfo from '@/hooks/useUserInfo';
import { School } from '@/services/childrenServices';
import { useGetAllSchools } from '@/services/schoolsServices';
import { useCallback, useEffect, useState } from 'react';

export interface UseSchoolsDataProps {
  pageSize?: number;
  initialSearch?: string;
}

export interface UseSchoolsDataReturn {
  // Data
  schools: School[];
  
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

export const useSchoolsData = ({
  pageSize = 10,
  initialSearch = '',
}: UseSchoolsDataProps = {}): UseSchoolsDataReturn => {
  // Hooks
  const userInfo = useUserInfo();
  const getParentSchools = useGetAllSchools();
  
  // State
  const [schools, setSchools] = useState<School[]>([]);
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

  // Fetch schools data
  const fetchSchools = useCallback(async (
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

      const response = await getParentSchools({
        parentId,
        pageNumber: page,
        pageSize,
        search: search.trim(),
      });

      if (response.success && response.data) {
        const newSchools = response.data.data || [];
        
        if (isRefresh || page === 1) {
          // Replace data for refresh or first page
          setSchools(newSchools);
          setCurrentPage(1);
        } else {
          // Append data for load more
          setSchools(prev => [...prev, ...newSchools]);
        }
        
        setTotalCount(response.data.totalCount);
        setCurrentPage(page);
        
        // Calculate if there's a next page
        const totalPages = Math.ceil(response.data.totalCount / pageSize);
        setHasNextPage(page < totalPages);
        
      } else {
        throw new Error(response.error || 'Failed to fetch schools');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while fetching schools';
      setError(errorMessage);
      console.error('Error fetching schools:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [parentId, getParentSchools, pageSize, searchQuery]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || isLoading) return;
    
    const nextPage = currentPage + 1;
    await fetchSchools(nextPage, searchQuery, false, true);
  }, [hasNextPage, isLoadingMore, isLoading, currentPage, searchQuery, fetchSchools]);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchSchools(1, searchQuery, true, false);
  }, [searchQuery, fetchSchools]);

  // Search function with debouncing handled by the component
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset pagination and fetch new data
    fetchSchools(1, query, false, false);
  }, [fetchSchools]);

  // Retry function
  const retry = useCallback(() => {
    fetchSchools(1, searchQuery, false, false);
  }, [fetchSchools, searchQuery]);

  // Initial data fetch
  useEffect(() => {
    if (parentId) {
      fetchSchools(1, initialSearch);
    }
  }, [parentId]); // Only run when parentId changes

  // Debug logging
  useEffect(() => {
    console.log('Schools data state:', {
      schoolsCount: schools.length,
      isLoading,
      isLoadingMore,
      currentPage,
      hasNextPage,
      totalCount,
      error,
      parentId,
    });
  }, [schools.length, isLoading, isLoadingMore, currentPage, hasNextPage, totalCount, error, parentId]);

  return {
    // Data
    schools,
    
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