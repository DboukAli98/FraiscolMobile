// hooks/useMerchandiseData.ts
import { SchoolMerchandise, useGetSchoolMerchandises } from '@/services/merchandisesServices';
import { useCallback, useEffect, useState } from 'react';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [error, setError] = useState<string | null>(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [filters, setFilters] = useState<FiltersState>({
        schoolId,
        categoryId,
        search: initialSearch,
    });

    // Fetch merchandises data
    const fetchMerchandises = useCallback(async (
        page: number = 1,
        search: string = searchQuery,
        currentFilters: FiltersState = filters,
        isRefresh: boolean = false,
        isLoadMore: boolean = false
    ) => {
        if (!currentFilters.schoolId) {
            setError('School ID is required');
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
                }
                
                setTotalCount(response.data.totalCount);
                setCurrentPage(page);
                
                // Calculate if there's a next page
                const totalPages = Math.ceil(response.data.totalCount / pageSize);
                setHasNextPage(page < totalPages);
                
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
        }
    }, [getSchoolMerchandises, pageSize, searchQuery, filters, all]);

    // Load more data
    const loadMore = useCallback(async () => {
        if (!hasNextPage || isLoadingMore || isLoading) return;
        
        const nextPage = currentPage + 1;
        await fetchMerchandises(nextPage, searchQuery, filters, false, true);
    }, [hasNextPage, isLoadingMore, isLoading, currentPage, searchQuery, filters, fetchMerchandises]);

    // Refresh data
    const refresh = useCallback(async () => {
        await fetchMerchandises(1, searchQuery, filters, true, false);
    }, [searchQuery, filters, fetchMerchandises]);

    // Search function with debouncing handled by the component
    const search = useCallback((query: string) => {
        setSearchQuery(query);
        const newFilters = { ...filters, search: query };
        setFilters(newFilters);
        // Reset pagination and fetch new data
        fetchMerchandises(1, query, newFilters, false, false);
    }, [filters, fetchMerchandises]);

    // Apply filters
    const applyFilters = useCallback((newFilters: FiltersState) => {
        setFilters(newFilters);
        setSearchQuery(newFilters.search || '');
        fetchMerchandises(1, newFilters.search || '', newFilters, false, false);
    }, [fetchMerchandises]);

    // Retry function
    const retry = useCallback(() => {
        fetchMerchandises(1, searchQuery, filters, false, false);
    }, [fetchMerchandises, searchQuery, filters]);

    // Initial data fetch
    useEffect(() => {
        if (schoolId) {
            const initialFilters = { schoolId, categoryId, search: initialSearch };
            setFilters(initialFilters);
            fetchMerchandises(1, initialSearch, initialFilters);
        }
    }, [schoolId, categoryId, initialSearch]); // Only run when key props change

    // Debug logging
    useEffect(() => {
        console.log('Merchandise data state:', {
            merchandiseCount: merchandises.length,
            isLoading,
            isLoadingMore,
            currentPage,
            hasNextPage,
            totalCount,
            error,
            schoolId,
            categoryId,
        });
    }, [merchandises.length, isLoading, isLoadingMore, currentPage, hasNextPage, totalCount, error, schoolId, categoryId]);

    return {
        // Data
        merchandises,
        
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
        applyFilters,
    };
};