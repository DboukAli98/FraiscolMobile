// hooks/useMerchandiseData.ts - FIXED VERSION

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
    isSearching: boolean;
    
    // Pagination
    hasNextPage: boolean;
    currentPage: number;
    totalCount: number;
    
    // Search
    searchQuery: string;
    debouncedSearchQuery: string;
    
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
    all = true, // ← CHANGED DEFAULT TO true
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
    const isLoadingRef = useRef(false);
    const hasTriedInitialLoad = useRef(false);
    const lastSearchQuery = useRef(initialSearch); // ← ADD THIS to track the last search that was executed

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

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
            search,
            searchLength: search.length
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
            
            // 🔍 UPDATE: Track the search query being executed
            lastSearchQuery.current = search;
            console.log("🔍 EXECUTING SEARCH:", `"${search}"`);
            
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
                    searchExecuted: search
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
    }, [getSchoolMerchandises, pageSize, all]);

    // Load more data
    const loadMore = useCallback(async () => {
        if (!isInitialized) {
            console.log('⚠️ Merchandises load more blocked - page 1 never loaded');
            return;
        }

        if (!hasNextPage || isLoadingMore || isLoading || isLoadingRef.current) {
            return;
        }
        
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
        console.log('🔍 Searching merchandises:', `"${query}"`);
        setSearchQuery(query);
        if (query !== debouncedSearchQuery) {
            setIsSearching(true);
        }
        // DON'T update filters here - let the debounced effect handle it
    }, [debouncedSearchQuery]);

    // Apply filters
    const applyFilters = useCallback((newFilters: FiltersState) => {
        console.log('🔍 Applying merchandises filters:', newFilters);
        setFilters(newFilters);
        setSearchQuery(newFilters.search || '');
        setCurrentPage(1);
        setIsInitialized(false);
        hasTriedInitialLoad.current = false;
        if (newFilters.schoolId) {
            fetchMerchandisesInternal(1, newFilters.search || '', newFilters, false, false);
        }
    }, [fetchMerchandisesInternal]);

    // Retry function
    const retry = useCallback(() => {
        console.log('🔄 Retrying merchandises data...');
        setIsInitialized(false);
        hasTriedInitialLoad.current = false;
        fetchMerchandisesInternal(1, debouncedSearchQuery, filters, false, false);
    }, [debouncedSearchQuery, filters, fetchMerchandisesInternal]);

    // 🔍 FIXED: Handle debounced search properly
    useEffect(() => {
        console.log('🔍 DEBOUNCE EFFECT CHECK:', {
            schoolId,
            isInitialized,
            debouncedSearchQuery: `"${debouncedSearchQuery}"`,
            lastSearchQuery: `"${lastSearchQuery.current}"`,
            searchChanged: debouncedSearchQuery !== lastSearchQuery.current,
            isLoading: isLoadingRef.current
        });

        // Only trigger search if:
        // 1. We have schoolId and are initialized
        // 2. The debounced search query is different from what we last executed
        // 3. We're not currently loading
        if (schoolId && isInitialized && debouncedSearchQuery !== lastSearchQuery.current && !isLoadingRef.current) {
            console.log('✅ Triggering search with debounced query:', `"${debouncedSearchQuery}"`);
            const newFilters = { ...filters, search: debouncedSearchQuery };
            setFilters(newFilters);
            setCurrentPage(1);
            fetchMerchandisesInternal(1, debouncedSearchQuery, newFilters, false, false);
        } else {
            console.log('⏭️ Skipping debounced search - no change or conditions not met');
        }
    }, [schoolId, isInitialized, debouncedSearchQuery, filters, fetchMerchandisesInternal]);

    // Initial load effect
    useEffect(() => {
        console.log('🎯 Merchandises useEffect triggered:', {
            schoolId,
            isInitialized,
            hasTriedInitialLoad: hasTriedInitialLoad.current,
            isLoadingRef: isLoadingRef.current,
        });

        if (schoolId && !isInitialized && !hasTriedInitialLoad.current && !isLoadingRef.current) {
            console.log('✅ Triggering initial merchandises data load');
            hasTriedInitialLoad.current = true;
            const initialFilters = { schoolId, categoryId, search: initialSearch };
            setFilters(initialFilters);
            fetchMerchandisesInternal(1, initialSearch, initialFilters, false, false);
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
            lastSearchExecuted: lastSearchQuery.current
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