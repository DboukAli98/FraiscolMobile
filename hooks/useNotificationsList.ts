import {
  Notification,
  useGetNotifications,
  useMarkAllNotificationsAsRead,
} from "@/services/notificationServices";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import useUserInfo from "./useUserInfo";

interface UseNotificationsListProps {
  type?: string;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useNotificationsList = ({
  type = "",
  pageSize = 10,
  autoFetch = true,
}: UseNotificationsListProps = {}) => {
  const userInfo = useUserInfo();
  const getNotifications = useGetNotifications();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!userInfo?.id) {
        console.log("No user ID available");
        return;
      }

      try {
        if (page === 1 && !append) {
          setIsLoading(true);
        } else if (append) {
          setIsLoadingMore(true);
        }

        setError(null);

        const response = await getNotifications({
          userId: userInfo.id,
          type,
          pageNumber: page,
          pageSize,
        });

        if (response.success && response.data?.data) {
          const newNotifications = response.data.data;

          if (append) {
            setNotifications((prev) => [...prev, ...newNotifications]);
          } else {
            setNotifications(newNotifications);
          }

          setTotalCount(response.data.totalCount);
          setCurrentPage(page);
          setHasMore(newNotifications.length === pageSize);

          // Count unread notifications
          const unread = newNotifications.filter((n) => !n.isRead).length;
          if (!append) {
            setUnreadCount(unread);
          }
        } else {
          if (page === 1) {
            setNotifications([]);
            setTotalCount(0);
            setUnreadCount(0);
          }
          setError(response.error || "Aucune notification");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Une erreur est survenue");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [userInfo?.id, type, pageSize, getNotifications]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!isLoadingMore && hasMore) {
      await fetchNotifications(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, currentPage, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!userInfo?.id) return;

    try {
      const response = await markAllAsRead({
        userId: userInfo.id,
        type,
      });

      if (response.success) {
        // Update all notifications to read
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        return true;
      } else {
        console.error("Failed to mark all as read:", response.error);
        return false;
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
      return false;
    }
  }, [userInfo?.id, type, markAllAsRead]);

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const retry = useCallback(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  useEffect(() => {
    if (autoFetch && userInfo?.id) {
      fetchNotifications(1, false);
    }
  }, [autoFetch, userInfo?.id, type]);

  // Auto-refresh when app comes to foreground
  useEffect(() => {
    if (!autoFetch || !userInfo?.id) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchNotifications(1, false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [autoFetch, userInfo?.id]);

  // Refresh when screen comes into focus (e.g., navigating back from notifications page)
  useFocusEffect(
    useCallback(() => {
      if (autoFetch && userInfo?.id) {
        fetchNotifications(1, false);
      }
    }, [autoFetch, userInfo?.id])
  );

  return {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    currentPage,
    totalCount,
    hasMore,
    unreadCount,
    refresh,
    loadMore,
    markAllRead,
    markAsRead,
    retry,
    fetchNotifications,
  };
};
