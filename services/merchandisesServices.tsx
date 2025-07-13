// services/merchandiseServices.tsx
import { useCallback } from "react";
import useApiInstance from "./apiClient";

// Types
export interface SchoolMerchandise {
    schoolMerchandiseId: number;
    schoolMerchandiseName: string;
    schoolMerchandiseDescription: string;
    schoolMerchandisePrice: number;
    schoolMerchandiseLogo: string;
    fK_SchoolId: number;
    school: any | null;
    fK_SchoolMerchandiseCategory: number;
    schoolMerchandiseCategory: any | null;
    fK_StatusId: number;
    status: any | null;
    createdOn: string;
    modifiedOn: string | null;
}

export interface GetSchoolMerchandisesParams {
    schoolId: string;
    categoryId?: number;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    all?: boolean;
}

export interface GetSchoolMerchandisesResponse {
    data: SchoolMerchandise[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}

interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

export const useGetSchoolMerchandises = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getSchoolMerchandises = useCallback(
        async ({
            schoolId,
            categoryId,
            pageNumber = 1,
            pageSize = 10,
            search = "",
            all = false,
        }: GetSchoolMerchandisesParams): Promise<ApiResponse<GetSchoolMerchandisesResponse>> => {
            try {
                console.log("Scchooolll IDDD", schoolId);
                const params = new URLSearchParams({
                    SchoolId: schoolId,
                    PageNumber: pageNumber.toString(),
                    PageSize: pageSize.toString(),
                    Search: search,
                    all: all.toString(),
                });

                // Only add CategoryId if it's provided and not 0
                if (categoryId && categoryId > 0) {
                    params.append('CategoryId', categoryId.toString());
                }

                const response = await api.get<GetSchoolMerchandisesResponse>(
                    `/api/School/GetSchoolMerchandises?${params.toString()}`
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

                console.error("Get school merchandises error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching school merchandises",
                };
            }
        },
        [api]
    );

    return getSchoolMerchandises;
};