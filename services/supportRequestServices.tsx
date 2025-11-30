import {
    AddSupportRequestInSystemRequestDto,
    AddSupportRequestInSystemResponseDto,
    GetAllSupportRequestsParams,
    GetAllSupportRequestsResponse,
    GetSupportRequestByIdParams,
    GetSupportRequestByIdResponse,
} from '@/models/SupportRequestInterfaces';
import { useCallback } from 'react';
import useApiInstance from './apiClient';

// Base API response wrapper
interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

// Add Support Request
export const useAddSupportRequest = () => {
    const api = useApiInstance();

    const addSupportRequest = useCallback(
        async (
            request: AddSupportRequestInSystemRequestDto
        ): Promise<ApiResponse<AddSupportRequestInSystemResponseDto>> => {
            try {
                const response = await api.post<AddSupportRequestInSystemResponseDto>(
                    '/api/SupportRequest/AddSupportRequest',
                    request
                );

                return {
                    success: true,
                    status: response.status,
                    data: response.data,
                    error: null,
                };
            } catch (error: any) {
                const status = error?.response?.status || 500;
                const errorData = error?.response?.data?.error || error?.response?.data?.Error;

                console.error('❌ Add Support Request Error Details:');
                console.error('   Status Code:', status);
                console.error('   Error Message:', errorData);
                console.error('   Error Name:', error?.name);
                console.error('   Error Code:', error?.code);
                console.error('   Request URL:', error?.config?.url);
                console.error('   Request Method:', error?.config?.method);
                console.error('   Request Headers:', error?.config?.headers);
                console.error('   Request Data:', JSON.stringify(request, null, 2));
                console.error('   Response Headers:', error?.response?.headers);
                console.error('   Response Data:', JSON.stringify(error?.response?.data, null, 2));
                console.error('   Full Error Message:', error?.message);
                console.error('   Stack Trace:', error?.stack);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || 'Une erreur est survenue lors de l\'envoi de la demande.',
                };
            }
        },
        [api]
    );

    return addSupportRequest;
};

// Get All Support Requests
export const useGetAllSupportRequests = () => {
    const api = useApiInstance();

    const getAllSupportRequests = useCallback(
        async (
            params: GetAllSupportRequestsParams
        ): Promise<ApiResponse<GetAllSupportRequestsResponse>> => {
            try {
                const queryParams = new URLSearchParams({
                    Source: params.Source,
                    PageNumber: (params.PageNumber || 1).toString(),
                    PageSize: (params.PageSize || 10).toString(),
                });

                if (params.ParentId) queryParams.append('ParentId', params.ParentId.toString());
                if (params.AgentId) queryParams.append('AgentId', params.AgentId.toString());
                if (params.SchoolId) queryParams.append('SchoolId', params.SchoolId.toString());
                if (params.SupportRequestType) queryParams.append('SupportRequestType', params.SupportRequestType);
                if (params.FilterByCurrentUser !== undefined) queryParams.append('FilterByCurrentUser', params.FilterByCurrentUser.toString());
                if (params.Search) queryParams.append('Search', params.Search);

                const response = await api.get<GetAllSupportRequestsResponse>(
                    `/api/SupportRequest/GetAllSupportRequests?${queryParams.toString()}`
                );

                return {
                    success: true,
                    status: response.status,
                    data: response.data,
                    error: null,
                };
            } catch (error: any) {
                const status = error?.response?.status || 500;
                const errorData = error?.response?.data?.error || error?.response?.data?.Error;

                console.error('❌ Get Support Requests Error:', {
                    status,
                    errorData,
                    params,
                });

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || 'Une erreur est survenue lors de la récupération des demandes.',
                };
            }
        },
        [api]
    );

    return getAllSupportRequests;
};

// Get Support Request By ID
export const useGetSupportRequestById = () => {
    const api = useApiInstance();

    const getSupportRequestById = useCallback(
        async (
            params: GetSupportRequestByIdParams
        ): Promise<ApiResponse<GetSupportRequestByIdResponse>> => {
            try {
                const queryParams = new URLSearchParams({
                    SupportRequestId: params.SupportRequestId.toString(),
                });

                const response = await api.get<GetSupportRequestByIdResponse>(
                    `/api/SupportRequest/GetSupportRequestById?${queryParams.toString()}`
                );

                return {
                    success: true,
                    status: response.status,
                    data: response.data,
                    error: null,
                };
            } catch (error: any) {
                const status = error?.response?.status || 500;
                const errorData = error?.response?.data?.error || error?.response?.data?.Error;

                console.error('❌ Get Support Request By ID Error:', {
                    status,
                    errorData,
                    params,
                });

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || 'Une erreur est survenue lors de la récupération de la demande.',
                };
            }
        },
        [api]
    );

    return getSupportRequestById;
};
