// hooks/useMerchandiseData.ts
import { SchoolMerchandise, useGetSchoolMerchandises } from '@/services/merchandisesServices';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMerchandiseDataProps {
    schoolId: string;
    categoryId?: number;
    pageSize?: number;
    initialSearch?: string;
    all?: boolean;
}

interface FiltersState {
    schoolId: string;
    categoryId?: number;
    search?: string;
}

export interface UseMerchandiseDataReturn {
    // Data
    merchandises: SchoolMerchandise[];
    
    // Loading states
    isLoading: boolean;
    isLoadingMore: boolean;
    isRefreshing: boolean;
    isSearching: boolean; // Added for search loading state
    
    // Pagination
    hasNextPage: boolean;
    currentPage: number;
    totalCount: number;
    
    // Search
    searchQuery: string;
    debouncedSearchQuery: string; // Added for better search handling
    
    // Error handling
    error: string | null;
    
    // Actions
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    search: (query: string) => void;
    retry: () => void;
    applyFilters: (filters: FiltersState) => void;
}

export const useMerchandiseData = ({
    schoolId,
    categoryId,
    pageSize = 10,
    initialSearch = '',
    all = false,
}: UseMerchandiseDataProps): UseMerchandiseDataReturn => {
    // Hooks
    const getSchoolMerchandises = useGetSchoolMerchandises();
    
    // State
    const [merchandises, setMerchandises] = useState<SchoolMerchandise[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [filters, setFilters] = useState<FiltersState>({
        schoolId,
        categoryId,
        search: initialSearch,
    });

    // Track initialization state to prevent multiple initial loads
    const [isInitialized, setIsInitialized] = useState(false);
    const isLoadingRef = useRef(false); // Prevent concurrent requests
    const hasTriedInitialLoad = useRef(false); // Track if we've attempted initial load

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Internal fetch function with concurrency protection
    const fetchMerchandisesInternal = useCallback(async (
        page: number = 1,
        search: string = debouncedSearchQuery,
        currentFilters: FiltersState = filters,
        isRefresh: boolean = false,
        isLoadMore: boolean = false
    ) => {
        console.log('🚀 fetchMerchandisesInternal called:', {
            page,
            isRefresh,
            isLoadMore,
            isLoadingRef: isLoadingRef.current,
            schoolId: currentFilters.schoolId,
            search
        });

        // Prevent concurrent requests
        if (isLoadingRef.current) {
            console.log('⚠️ Merchandises request blocked - already loading');
            return;
        }

        if (!currentFilters.schoolId) {
            setError('School ID is required');
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

            const response = await getSchoolMerchandises({
                schoolId: currentFilters.schoolId,
                categoryId: currentFilters.categoryId,
                pageNumber: page,
                pageSize,
                search: search.trim(),
                all,
            });

            if (response.success && response.data) {
                const newMerchandises = response.data.data || [];
                
                if (isRefresh || page === 1) {
                    // Replace data for refresh or first page
                    setMerchandises(newMerchandises);
                    setCurrentPage(1);
                } else {
                    // Append data for load more
                    setMerchandises(prev => [...prev, ...newMerchandises]);
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

                console.log('📊 Merchandises data loaded:', {
                    newCount: newMerchandises.length,
                    totalCount: response.data.totalCount,
                    currentPage: page,
                    hasNextPage: page < totalPages,
                });
                
            } else {
                throw new Error(response.error || 'Failed to fetch merchandises');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'An error occurred while fetching merchandises';
            setError(errorMessage);
            console.error('Error fetching merchandises:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
            setIsRefreshing(false);
            setIsSearching(false);
            isLoadingRef.current = false;
        }
    }, [getSchoolMerchandises, pageSize, debouncedSearchQuery, filters, all]);

    // Load more data
    const loadMore = useCallback(async () => {
        // CRITICAL: Don't allow load more if page 1 was never loaded
        if (!isInitialized) {
            console.log('⚠️ Merchandises load more blocked - page 1 never loaded, triggering initial load instead');
            if (!isLoadingRef.current && hasTriedInitialLoad.current === false) {
                hasTriedInitialLoad.current = true;
                await fetchMerchandisesInternal(1, debouncedSearchQuery, filters, false, false);
            }
            return;
        }

        if (!hasNextPage || isLoadingMore || isLoading || isLoadingRef.current) {
            console.log('⚠️ Merchandises load more blocked:', {
                hasNextPage,
                isLoadingMore,
                isLoading,
                isLoadingRef: isLoadingRef.current,
            });
            return;
        }
        
        console.log('📄 Loading more merchandises, next page:', currentPage + 1);
        const nextPage = currentPage + 1;
        await fetchMerchandisesInternal(nextPage, debouncedSearchQuery, filters, false, true);
    }, [hasNextPage, isLoadingMore, isLoading, currentPage, debouncedSearchQuery, filters, isInitialized, fetchMerchandisesInternal]);

    // Refresh data
    const refresh = useCallback(async () => {
        console.log('🔄 Refreshing merchandises data...');
        await fetchMerchandisesInternal(1, debouncedSearchQuery, filters, true, false);
    }, [debouncedSearchQuery, filters, fetchMerchandisesInternal]);

    // Search function - only updates search query, doesn't fetch immediately
    const search = useCallback((query: string) => {
        console.log('🔍 Searching merchandises:', query);
        setSearchQuery(query);
        if (query !== debouncedSearchQuery) {
            setIsSearching(true); // Show search loading when query changes
        }
        const newFilters = { ...filters, search: query };
        setFilters(newFilters);
    }, [filters, debouncedSearchQuery]);

    // Apply filters
    const applyFilters = useCallback((newFilters: FiltersState) => {
        console.log('🔍 Applying merchandises filters:', newFilters);
        setFilters(newFilters);
        setSearchQuery(newFilters.search || '');
        setCurrentPage(1);
        setIsInitialized(false); // Reset initialization for filter change
        hasTriedInitialLoad.current = false; // Reset the attempt flag
        if (newFilters.schoolId) {
            fetchMerchandisesInternal(1, newFilters.search || '', newFilters, false, false);
        }
    }, [fetchMerchandisesInternal]);

    // Retry function
    const retry = useCallback(() => {
        console.log('🔄 Retrying merchandises data...');
        setIsInitialized(false); // Reset initialization to allow re-fetch
        hasTriedInitialLoad.current = false; // Reset the attempt flag
        fetchMerchandisesInternal(1, debouncedSearchQuery, filters, false, false);
    }, [debouncedSearchQuery, filters, fetchMerchandisesInternal]);

    // Fetch data when debounced search query changes (only for search, not filters)
    useEffect(() => {
        if (schoolId && isInitialized && debouncedSearchQuery !== filters.search && !isLoadingRef.current) {
            console.log('🔍 Debounced merchandises search triggered:', debouncedSearchQuery);
            const newFilters = { ...filters, search: debouncedSearchQuery };
            setFilters(newFilters);
            setCurrentPage(1);
            fetchMerchandisesInternal(1, debouncedSearchQuery, newFilters, false, false);
        }
    }, [schoolId, isInitialized, debouncedSearchQuery]);

    // Initial load effect - SINGLE POINT OF TRUTH
    useEffect(() => {
        console.log('🎯 Merchandises useEffect triggered:', {
            schoolId,
            isInitialized,
            hasTriedInitialLoad: hasTriedInitialLoad.current,
            isLoadingRef: isLoadingRef.current,
        });

        // Only load data once when:
        // 1. We have a schoolId
        // 2. We haven't initialized yet
        // 3. We haven't tried loading yet
        // 4. We're not currently loading
        if (schoolId && !isInitialized && !hasTriedInitialLoad.current && !isLoadingRef.current) {
            console.log('✅ Triggering initial merchandises data load');
            hasTriedInitialLoad.current = true; // Mark that we've attempted
            const initialFilters = { schoolId, categoryId, search: initialSearch };
            setFilters(initialFilters);
            fetchMerchandisesInternal(1, initialSearch, initialFilters, false, false);
        } else {
            console.log('⏭️ Skipping merchandises initial load:', {
                hasSchoolId: !!schoolId,
                isInitialized,
                hasTriedInitialLoad: hasTriedInitialLoad.current,
                isLoading: isLoadingRef.current,
            });
        }
    }, [schoolId, isInitialized]);

    // Force initial load if we somehow have no data after a delay
    useEffect(() => {
        if (schoolId && !isInitialized && !isLoadingRef.current) {
            const timer = setTimeout(() => {
                console.log('🔥 Force initial merchandises load - ensuring page 1 loads');
                if (!isInitialized && !isLoadingRef.current) {
                    hasTriedInitialLoad.current = true;
                    const initialFilters = { schoolId, categoryId, search: debouncedSearchQuery };
                    setFilters(initialFilters);
                    fetchMerchandisesInternal(1, debouncedSearchQuery, initialFilters, false, false);
                }
            }, 1000); // Wait 1 second then force load if still no data

            return () => clearTimeout(timer);
        }
    }, [schoolId, isInitialized]);

    // Debug logging
    useEffect(() => {
        console.log('Merchandise data state:', {
            merchandiseCount: merchandises.length,
            isLoading,
            isLoadingMore,
            isSearching,
            currentPage,
            hasNextPage,
            totalCount,
            error,
            schoolId,
            categoryId,
            isInitialized,
            searchQuery,
            debouncedSearchQuery,
        });
    }, [merchandises.length, isLoading, isLoadingMore, isSearching, currentPage, hasNextPage, totalCount, error, schoolId, categoryId, isInitialized, searchQuery, debouncedSearchQuery]);

    return {
        // Data
        merchandises,
        
        // Loading states
        isLoading,
        isLoadingMore,
        isRefreshing,
        isSearching,
        
        // Pagination
        hasNextPage,
        currentPage,
        totalCount,
        
        // Search
        searchQuery,
        debouncedSearchQuery,
        
        // Error handling
        error,
        
        // Actions
        loadMore,
        refresh,
        search,
        retry,
        applyFilters,
    };
};