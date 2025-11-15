import {
  CollectingAgentActivityDto,
  CollectingAgentActivityType,
  GetMyActivitiesParams,
  useGetMyActivities,
} from "@/services/collectingAgentActivityServices";
import { useCallback, useEffect, useState } from "react";
import useUserInfo from "./useUserInfo";

interface UseActivitiesListOptions {
  startDate?: string;
  endDate?: string;
  activityType?: CollectingAgentActivityType;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useActivitiesList = (options: UseActivitiesListOptions = {}) => {
  const {
    startDate,
    endDate,
    activityType,
    pageSize = 10,
    autoFetch = true,
  } = options;

  const userInfo = useUserInfo();
  const getMyActivities = useGetMyActivities();

  const [activities, setActivities] = useState<CollectingAgentActivityDto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchActivities = useCallback(
    async (page: number, append: boolean = false) => {
      if (!userInfo?.id) return;

      if (page === 1 && !append) {
        setIsLoading(true);
      }
      setError(null);

      const params: GetMyActivitiesParams = {
        startDate,
        endDate,
        activityType,
        pageNumber: page,
        pageSize,
      };

      try {
        const {
          success,
          data,
          error: apiError,
        } = await getMyActivities(params);

        if (success && data) {
          const newActivities = data.data || [];
          setActivities((prev) =>
            append ? [...prev, ...newActivities] : newActivities
          );
          setTotalCount(data.totalCount);
          setCurrentPage(page);
          setHasMore(
            (append ? activities.length : 0) + newActivities.length <
              data.totalCount
          );
        } else {
          setError(apiError || "Impossible de charger les activités");
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des activités");
        console.error("Error fetching activities:", err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [
      userInfo?.id,
      startDate,
      endDate,
      activityType,
      pageSize,
      getMyActivities,
      activities.length,
    ]
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setCurrentPage(1);
    fetchActivities(1, false);
  }, [fetchActivities]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    fetchActivities(currentPage + 1, true);
  }, [hasMore, isLoadingMore, currentPage, fetchActivities]);

  const retry = useCallback(() => {
    fetchActivities(currentPage, false);
  }, [currentPage, fetchActivities]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && userInfo?.id) {
      fetchActivities(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, userInfo?.id, startDate, endDate, activityType]);

  return {
    activities,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    currentPage,
    totalCount,
    hasMore,
    refresh,
    loadMore,
    retry,
  };
};
