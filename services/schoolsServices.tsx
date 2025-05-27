import { useCallback } from "react";
import useApiInstance from "./apiClient";
import { School } from "./childrenServices";


//#region Types

interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

interface GetSchoolDetailsParams {
    schoolId: number;
}

interface GetSchoolDetailsResponse {
    data: School;
    status: string;
    error: any | null;
    message: string | null;
}


export interface GetSchoolGradesSectionsParams {
    schoolId: number;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    onlyEnabled?: boolean;
}

export interface SchoolGradeSection {
    schoolGradeSectionId: number;
    fK_SchoolId: number;
    schoolGradeName: string;
    schoolGradeDescription: string;
    schoolGradeFee: number;
    termStartDate: string;
    termEndDate: string;
    fK_StatusId: number;
    createdOn: string;
    modifiedOn: string | null;
}

export interface GetSchoolGradesSectionsResponse {
    data: SchoolGradeSection[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}

//#endregion

export const useGetSchoolDetails = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getSchoolDetails = useCallback(
        async ({
            schoolId
        }: GetSchoolDetailsParams): Promise<ApiResponse<GetSchoolDetailsResponse>> => {
            const params = new URLSearchParams({
                SchoolId: schoolId.toString(),
            }).toString();

            try {
                const response = await api.get<GetSchoolDetailsResponse>(
                    `/api/School/GetSchoolDetails?${params}`
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

                console.error("Get school details error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching school details",
                };
            }
        },
        [api]
    );

    return getSchoolDetails;
};

export const useGetSchoolGradesSections = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getSchoolGradesSections = useCallback(
        async ({
            schoolId,
            pageNumber = 1,
            pageSize = 100,
            search = "",
            onlyEnabled = true,
        }: GetSchoolGradesSectionsParams): Promise<ApiResponse<GetSchoolGradesSectionsResponse>> => {
            const params = new URLSearchParams({
                SchoolId: schoolId.toString(),
                PageNumber: pageNumber.toString(),
                PageSize: pageSize.toString(),
                Search: search,
                onlyEnabled: onlyEnabled.toString(),
            }).toString();

            try {
                const response = await api.get<GetSchoolGradesSectionsResponse>(
                    `/api/School/GetSchoolGradesSections?${params}`
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

                console.error("Get school grades sections error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching school sections",
                };
            }
        },
        [api]
    );

    return getSchoolGradesSections;
};