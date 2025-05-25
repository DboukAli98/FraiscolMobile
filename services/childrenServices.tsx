import { useCallback } from "react";
import useApiInstance from "./apiClient";



interface GetChildrenDetailsParams {

    childrenId: number;
}

interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

export interface School {
    schoolId: number;
    schoolName: string;
    schoolAddress: string;
    schoolPhoneNumber: string;
    schoolEmail: string;
    schoolEstablishedYear: number;
    schoolDescription: string;
    schoolWebsite: string;
    schoolLogo: string | null;
    schoolGradeSections: any | null;
    schoolMerchandises: any | null;
    childrens: any[];
    parentSchools: any | null;
    supportRequests: any | null;
    director: any | null;
    fK_StatusId: number;
    status: any | null;
    createdOn: string;
    modifiedOn: string | null;
}

export interface ChildDetailsData {
    childId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    fatherName: string;
    fK_ParentId: number;
    parent: any | null;
    fK_SchoolId: number;
    school: School;
    fK_StatusId: number;
    status: any | null;
    childGrades: any | null;
    createdOn: string;
    modifiedOn: string | null;
}

export interface GetChildDetailsResponse {
    data: ChildDetailsData;
    status: string;
    error: any | null;
    message: string | null;
}



export const useGetChildrenDetails = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getChildrenDetails = useCallback(
        async ({
            childrenId
        }: GetChildrenDetailsParams): Promise<ApiResponse<GetChildDetailsResponse>> => {
            const params = new URLSearchParams({
                ChildrenId: childrenId.toString(),
            }).toString();

            try {
                const response = await api.get<GetChildDetailsResponse>(
                    `/api/Children/GetSingleChildren?${params}`
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

                console.error("Get parent childrens error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching parent childrens",
                };
            }
        },
        [api]
    );

    return getChildrenDetails;
};