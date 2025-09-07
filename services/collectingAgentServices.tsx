import { useCallback } from 'react';
import useApiInstance from './apiClient';

// Base API response wrapper used across the app
interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

// Request params for the endpoint
export interface GetCollectingAgentParentsParams {
    collectingAgentId: number;
    pageNumber?: number;
    pageSize?: number;
}

// Parent DTO based on provided sample
export interface CollectingAgentParentDto {
    parentId: number;
    firstName: string;
    lastName: string;
    fatherName: string;
    countryCode: string;
    phoneNumber: string;
    civilId: string;
    email: string;
    oneSignalPlayerId: string | null;
    childrens: any | null;
    parentSchools: any | null;
    supportRequests: any | null;
    fK_StatusId: number;
    status: any | null;
    fK_UserId: string;
    createdOn: string;
    modifiedOn: string | null;
}

// Paged response shape
export interface GetCollectingAgentParentsResponse {
    data: CollectingAgentParentDto[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}

/**
 * Hook: useGetCollectingAgentParents
 * Calls GET /api/CollectingAgent/GetCollectingAgentParents
 */
export const useGetCollectingAgentParents = () => {
    const api = useApiInstance({
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'fr',
        },
    });

    const getCollectingAgentParents = useCallback(
        async ({
            collectingAgentId,
            pageNumber = 1,
            pageSize = 10,
        }: GetCollectingAgentParentsParams): Promise<ApiResponse<GetCollectingAgentParentsResponse>> => {
            const params = new URLSearchParams({
                CollectingAgentId: collectingAgentId.toString(),
                PageNumber: pageNumber.toString(),
                PageSize: pageSize.toString(),
            }).toString();

            try {
                const response = await api.get<GetCollectingAgentParentsResponse>(
                    `/api/CollectingAgent/GetCollectingAgentParents?${params}`
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

                console.error('Get collecting agent parents error:', error);

                return {
                    success: false,
                    status,
                    data: null,
                    error: errorData || "Une erreur s'est produite lors de la récupération des parents de l'agent",
                };
            }
        },
        [api]
    );

    return getCollectingAgentParents;
};
