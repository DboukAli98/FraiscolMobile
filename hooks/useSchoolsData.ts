// hooks/useSchoolsData.ts
import useUserInfo from "@/hooks/useUserInfo";
import { School } from "@/services/childrenServices";
import { useGetParentSchools } from "@/services/userServices";
import { useCallback, useEffect, useRef, useState } from "react";

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
}

export const useSchoolsData = ({
  pageSize = 10,
  initialSearch = "",
}: UseSchoolsDataProps = {}): UseSchoolsDataReturn => {
  // Hooks
  const userInfo = useUserInfo();
  const getParentSchools = useGetParentSchools();

  // State
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState(initialSearch);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Track initialization state to prevent multiple initial loads
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoadingRef = useRef(false); // Prevent concurrent requests
  const hasTriedInitialLoad = useRef(false); // Track if we've attempted initial load

  // Get parent ID from user info
  const parentId = userInfo?.parentId ? parseInt(userInfo.parentId) : null;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Internal fetch function with concurrency protection
  const fetchSchoolsInternal = useCallback(
    async (
      page: number = 1,
      search: string = debouncedSearchQuery,
      isRefresh: boolean = false,
      isLoadMore: boolean = false
    ) => {
      console.log("🚀 fetchSchoolsInternal called:", {
        page,
        isRefresh,
        isLoadMore,
        isLoadingRef: isLoadingRef.current,
        parentId,
        search,
      });

      // Prevent concurrent requests
      if (isLoadingRef.current) {
        console.log("⚠️ Schools request blocked - already loading");
        return;
      }

      if (!parentId) {
        setError("Parent ID not found");
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
            setSchools((prev) => [...prev, ...newSchools]);
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

          console.log("📊 Schools data loaded:", {
            newCount: newSchools.length,
            totalCount: response.data.totalCount,
            currentPage: page,
            hasNextPage: page < totalPages,
          });
        } else {
          throw new Error(response.error || "Failed to fetch schools");
        }
      } catch (err: any) {
        const errorMessage =
          err.message || "An error occurred while fetching schools";
        setError(errorMessage);
        console.error("Error fetching schools:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        setIsSearching(false);
        isLoadingRef.current = false;
      }
    },
    [parentId, getParentSchools, pageSize, debouncedSearchQuery]
  );

  // Load more data
  const loadMore = useCallback(async () => {
    // CRITICAL: Don't allow load more if page 1 was never loaded
    if (!isInitialized) {
      console.log(
        "⚠️ Schools load more blocked - page 1 never loaded, triggering initial load instead"
      );
      if (!isLoadingRef.current && hasTriedInitialLoad.current === false) {
        hasTriedInitialLoad.current = true;
        await fetchSchoolsInternal(1, debouncedSearchQuery, false, false);
      }
      return;
    }

    if (!hasNextPage || isLoadingMore || isLoading || isLoadingRef.current) {
      console.log("⚠️ Schools load more blocked:", {
        hasNextPage,
        isLoadingMore,
        isLoading,
        isLoadingRef: isLoadingRef.current,
      });
      return;
    }

    console.log("📄 Loading more schools, next page:", currentPage + 1);
    const nextPage = currentPage + 1;
    await fetchSchoolsInternal(nextPage, debouncedSearchQuery, false, true);
  }, [
    hasNextPage,
    isLoadingMore,
    isLoading,
    currentPage,
    debouncedSearchQuery,
    isInitialized,
    fetchSchoolsInternal,
  ]);

  // Refresh data
  const refresh = useCallback(async () => {
    console.log("🔄 Refreshing schools data...");
    await fetchSchoolsInternal(1, debouncedSearchQuery, true, false);
  }, [debouncedSearchQuery, fetchSchoolsInternal]);

  // Search function - only updates search query, doesn't fetch immediately
  const search = useCallback(
    (query: string) => {
      console.log("🔍 Searching schools:", query);
      setSearchQuery(query);
      if (query !== debouncedSearchQuery) {
        setIsSearching(true); // Show search loading when query changes
      }
      setCurrentPage(1);
      setIsInitialized(false); // Reset initialization to allow re-fetch
      hasTriedInitialLoad.current = false; // Reset the attempt flag
    },
    [debouncedSearchQuery]
  );

  // Retry function
  const retry = useCallback(() => {
    console.log("🔄 Retrying schools data...");
    setIsInitialized(false); // Reset initialization to allow re-fetch
    hasTriedInitialLoad.current = false; // Reset the attempt flag
    fetchSchoolsInternal(1, debouncedSearchQuery, false, false);
  }, [debouncedSearchQuery, fetchSchoolsInternal]);

  // Fetch data when debounced search query changes
  useEffect(() => {
    if (parentId && debouncedSearchQuery !== initialSearch) {
      fetchSchoolsInternal(1, debouncedSearchQuery, false, false);
    }
  }, [parentId, debouncedSearchQuery]);

  // Initial load effect - SINGLE POINT OF TRUTH
  useEffect(() => {
    console.log("🎯 Schools useEffect triggered:", {
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
    if (
      parentId &&
      !isInitialized &&
      !hasTriedInitialLoad.current &&
      !isLoadingRef.current
    ) {
      console.log("✅ Triggering initial schools data load");
      hasTriedInitialLoad.current = true; // Mark that we've attempted
      fetchSchoolsInternal(1, initialSearch, false, false);
    } else {
      console.log("⏭️ Skipping schools initial load:", {
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
        console.log("🔥 Force initial schools load - ensuring page 1 loads");
        if (!isInitialized && !isLoadingRef.current) {
          hasTriedInitialLoad.current = true;
          fetchSchoolsInternal(1, debouncedSearchQuery, false, false);
        }
      }, 1000); // Wait 1 second then force load if still no data

      return () => clearTimeout(timer);
    }
  }, [parentId, isInitialized]);

  // Debug logging
  useEffect(() => {
    console.log("Schools data state:", {
      schoolsCount: schools.length,
      isLoading,
      isLoadingMore,
      isSearching,
      currentPage,
      hasNextPage,
      totalCount,
      error,
      parentId,
      isInitialized,
      searchQuery,
      debouncedSearchQuery,
    });
  }, [
    schools.length,
    isLoading,
    isLoadingMore,
    isSearching,
    currentPage,
    hasNextPage,
    totalCount,
    error,
    parentId,
    isInitialized,
    searchQuery,
    debouncedSearchQuery,
  ]);

  return {
    // Data
    schools,

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
  };
};
