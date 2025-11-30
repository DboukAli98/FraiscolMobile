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

// Collecting Agent Details interfaces
export interface CollectingAgentParentAssignment {
    collectingAgentParentId: number;
    fK_CollectingAgentId: number;
    fK_ParentId: number;
    parent: any | null;
    assignedDate: string;
    unassignedDate: string | null;
    isActive: boolean;
    assignmentNotes: string;
    fK_AssignedByDirectorId: number;
    assignedByDirector: any | null;
    createdOn: string;
    modifiedOn: string | null;
}

export interface CollectingAgentDetailsData {
    collectingAgentId: number;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    assignedArea: string | null;
    commissionPercentage: number | null;
    oneSignalPlayerId: string | null;
    fK_SchoolId: number;
    school: any | null;
    fK_StatusId: number;
    status: any | null;
    collectingAgentParents: CollectingAgentParentAssignment[];
    processedTransactions: any[];
    handledSupportRequests: any[];
    commissionHistory: any[];
    fK_UserId: string;
    createdOn: string;
    modifiedOn: string | null;
}

export interface GetCollectingAgentDetailsParams {
    agentId: number;
}

export interface GetCollectingAgentDetailsResponse {
    data: CollectingAgentDetailsData | null;
    status: string;
    error: any | null;
    message: string | null;
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
 * Hook: useGetCollectingAgentDetails
 * Calls GET /api/CollectingAgent/GetCollectingAgentDetails
 */
export const useGetCollectingAgentDetails = () => {
    const api = useApiInstance({
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'fr',
        },
    });

    const getCollectingAgentDetails = useCallback(
        async ({
            agentId,
        }: GetCollectingAgentDetailsParams): Promise<ApiResponse<GetCollectingAgentDetailsResponse>> => {
            const params = new URLSearchParams({
                AgentId: agentId.toString(),
            }).toString();

            try {
                const response = await api.get<GetCollectingAgentDetailsResponse>(
                    `/api/CollectingAgent/GetCollectingAgentDetails?${params}`
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

                console.error('Get collecting agent details error:', error);

                return {
                    success: false,
                    status,
                    data: null,
                    error: errorData || "Une erreur s'est produite lors de la récupération des détails de l'agent",
                };
            }
        },
        [api]
    );

    return getCollectingAgentDetails;
};

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

/**
 * Hook: useGetParentsCollectingAgents
 * Calls GET /api/CollectingAgent/GetParentsCollectingAgents
 * Gets all collecting agents assigned to a specific parent
 */
export const useGetParentsCollectingAgents = () => {
    const api = useApiInstance({
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'fr',
        },
    });

    const getParentsCollectingAgents = useCallback(
        async ({
            parentId,
            pageNumber = 1,
            pageSize = 10,
        }: {
            parentId: number;
            pageNumber?: number;
            pageSize?: number;
        }): Promise<ApiResponse<{
            data: any[] | null;
            pageNumber: number;
            pageSize: number;
            totalCount: number;
            status: string;
            error: any | null;
            message: string | null;
        }>> => {
            const params = new URLSearchParams({
                ParentId: parentId.toString(),
                PageNumber: pageNumber.toString(),
                PageSize: pageSize.toString(),
            }).toString();

            try {
                const response = await api.get(
                    `/api/CollectingAgent/GetParentsCollectingAgents?${params}`
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

                console.error('❌ Get Parents Collecting Agents Error:', {
                    status,
                    errorData,
                    parentId,
                    response: error?.response?.data,
                });

                return {
                    success: false,
                    status,
                    data: null,
                    error: errorData || 'Une erreur est survenue lors de la récupération des agents.',
                };
            }
        },
        [api]
    );

    return getParentsCollectingAgents;
};
