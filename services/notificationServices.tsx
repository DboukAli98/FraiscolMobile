import { useCallback } from 'react';
import useApiInstance from './apiClient';

// Base API response wrapper
interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

// Notification model
export interface Notification {
    notificationId: number;
    userId: string;
    title: string;
    message: string;
    type: string; // "Reminder", "Alert", "Payment", etc.
    isRead: boolean;
    createdAt: string;
    scheduledFor: string | null;
}

// Get Notifications
export interface GetNotificationsParams {
    userId: string;
    type?: string;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
}

export interface GetNotificationsResponse {
    data: Notification[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}

export const useGetNotifications = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getNotifications = useCallback(
        async ({
            userId,
            type = "",
            pageNumber = 1,
            pageSize = 10,
            search = "",
        }: GetNotificationsParams): Promise<ApiResponse<GetNotificationsResponse>> => {
            try {
                const params = new URLSearchParams({
                    UserId: userId,
                    PageNumber: pageNumber.toString(),
                    PageSize: pageSize.toString(),
                });

                // Only add Type if it has a value
                if (type && type.trim() !== '') {
                    params.append('Type', type);
                }

                if (search && search.trim() !== '') {
                    params.append('Search', search);
                }

                const response = await api.get<GetNotificationsResponse>(
                    `/api/Notifications/GetNotifications?${params.toString()}`
                );

                return {
                    success: true,
                    status: response.status,
                    data: response.data,
                    error: null,
                };
            } catch (error: any) {
                const status = error.response ? error.response.status : 0;
                const errorData = error.response ? error.response.data : null;

                console.error("Get notifications error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching notifications",
                };
            }
        },
        [api]
    );

    return getNotifications;
};

// Get Notification By ID
export interface GetNotificationByIdParams {
    notificationId: number;
}

export interface GetNotificationByIdResponse {
    data: Notification;
    status: string;
    error: any | null;
    message: string | null;
}

export const useGetNotificationById = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getNotificationById = useCallback(
        async ({
            notificationId,
        }: GetNotificationByIdParams): Promise<ApiResponse<GetNotificationByIdResponse>> => {
            try {
                const response = await api.get<GetNotificationByIdResponse>(
                    `/api/Notifications/GetNotificationById?NotificationId=${notificationId}`
                );

                return {
                    success: true,
                    status: response.status,
                    data: response.data,
                    error: null,
                };
            } catch (error: any) {
                const status = error.response ? error.response.status : 0;
                const errorData = error.response ? error.response.data : null;

                console.error("Get notification by ID error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching notification",
                };
            }
        },
        [api]
    );

    return getNotificationById;
};

// Mark All Notifications As Read
export interface MarkAllNotificationsAsReadParams {
    userId: string;
    type?: string;
}

export interface MarkAllNotificationsAsReadResponse {
    status: string;
    error: any | null;
    message: string | null;
}

export const useMarkAllNotificationsAsRead = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const markAllAsRead = useCallback(
        async ({
            userId,
            type = "",
        }: MarkAllNotificationsAsReadParams): Promise<ApiResponse<MarkAllNotificationsAsReadResponse>> => {
            try {
                const requestData: any = {
                    UserId: userId,
                };

                // Only add Type if it has a value
                if (type && type.trim() !== '') {
                    requestData.Type = type;
                }

                const response = await api.post<MarkAllNotificationsAsReadResponse>(
                    `/api/Notifications/MarkAllAsRead`,
                    requestData
                );

                return {
                    success: true,
                    status: response.status,
                    data: response.data,
                    error: null,
                };
            } catch (error: any) {
                const status = error.response ? error.response.status : 0;
                const errorData = error.response ? error.response.data : null;

                console.error("Mark all as read error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while marking notifications as read",
                };
            }
        },
        [api]
    );

    return markAllAsRead;
};
