import { useCallback } from "react";
import useApiInstance from "./apiClient";
import { School } from "./childrenServices";


//#region  types

interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}
interface GetChildrenGradeParams {
    childrenId: number;
}

interface GetChildrenGradeSelectionParams {
    childGradeId: number;
}


export interface ChildGrade {
    childGradeId: number;
    fK_ChildId: number;
    fK_SchoolGradeSectionId: number;
    fK_StatusId: number;
    createdOn: string;
    modifiedOn: string | null;
    schoolGradeSection: {
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
        school: School;
    };
}
export interface ChildGradeSelection {
    childCycleSelectionId: number;
    fK_ChildGradeId: number;
    fK_PaymentCycleId: number;
    totalFee: string;
}

interface GetChildrenGradeResponse {
    data: ChildGrade;
    status: string;
    error: any | null;
    message: string | null;
}

interface GetChildrenGradeSelectionResponse {
    data: ChildGradeSelection;
    status: string;
    error: any | null;
    message: string | null;
}



// Payment Cycle interfaces
interface GetPaymentCyclesParams {
    schoolGradeSectionId: number;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
}

export interface PaymentCycle {
    paymentCycleId: number;
    paymentCycleName: string;
    paymentCycleDescription: string;
    fK_SchoolGradeSectionId: number;
    paymentCycleType: number;
    intervalCount: number | null;
    intervalUnit: number | null;
    installmentAmounts: string | null;
    planStartDate: string;
    createdOn: string;
    modifiedOn: string | null;
}

interface GetPaymentCyclesResponse {
    data: PaymentCycle[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}

// Child Cycle Selection interfaces
interface SelectChildCycleSelectionParams {
    childGradeId: number;
    paymentCycleId: number;
}

interface SelectChildCycleSelectionResponse {
    status: string;
    error: any | null;
    message: string | null;
}


export interface AddChildrenToSystemParams {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // Format: YYYY-MM-DD
    fatherName?: string;
    parentId: number;
    schoolId: number;
}

interface AddChildrenToSystemResponse {
    status: string;
    error: any | null;
    message: string | null;
}

interface AddChildGradeParams {
    childId: number;
    schoolGradeSectionId: number;
    statusId?: number;
}

interface AddChildGradeResponse {
    status: string;
    error: any | null;
    message: string | null;
}
//#endregion


export const useGetChildrenGrade = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getChildrenGrade = useCallback(
        async ({
            childrenId
        }: GetChildrenGradeParams): Promise<ApiResponse<GetChildrenGradeResponse>> => {
            const params = new URLSearchParams({
                ChildrenId: childrenId.toString(),
            }).toString();

            try {
                const response = await api.get<GetChildrenGradeResponse>(
                    `/api/Children/GetChildrenGrade?${params}`
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

                console.error("Get children grade error:", error.response);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching children grade",
                };
            }
        },
        [api]
    );

    return getChildrenGrade;
};

export const useGetChildrenGradeSelection = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getChildrenGradeSelection = useCallback(
        async ({
            childGradeId
        }: GetChildrenGradeSelectionParams): Promise<ApiResponse<GetChildrenGradeSelectionResponse>> => {
            const params = new URLSearchParams({
                ChildGradeId: childGradeId.toString(),
            }).toString();

            try {
                const response = await api.get<GetChildrenGradeSelectionResponse>(
                    `/api/School/GetChildCycleSelection?${params}`
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

                console.error("Get children grade error:", error.response);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching children grade",
                };
            }
        },
        [api]
    );

    return getChildrenGradeSelection;
};


// Payment Cycles Service
export const useGetPaymentCycles = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getPaymentCycles = useCallback(
        async ({
            schoolGradeSectionId,
            pageNumber = 1,
            pageSize = 10,
            search = "",
        }: GetPaymentCyclesParams): Promise<ApiResponse<GetPaymentCyclesResponse>> => {
            const params = new URLSearchParams({
                SchoolGradeSectionId: schoolGradeSectionId.toString(),
                PageNumber: pageNumber.toString(),
                PageSize: pageSize.toString(),
                Search: search,
            }).toString();

            try {
                const response = await api.get<GetPaymentCyclesResponse>(
                    `/api/School/GetPaymentCycles?${params}`
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

                console.error("Get payment cycles error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching payment cycles",
                };
            }
        },
        [api]
    );

    return getPaymentCycles;
};

// Child Cycle Selection Service
export const useSelectChildCycleSelection = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const selectChildCycleSelection = useCallback(
        async ({
            childGradeId,
            paymentCycleId,
        }: SelectChildCycleSelectionParams): Promise<ApiResponse<SelectChildCycleSelectionResponse>> => {
            const requestData = {
                childGradeId,
                paymentCycleId,
            };

            try {
                const response = await api.post<SelectChildCycleSelectionResponse>(
                    "/api/School/SelectChildCycleSelection",
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

                console.error("Select child cycle selection error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while selecting child cycle",
                };
            }
        },
        [api]
    );

    return selectChildCycleSelection;
};


export const useAddChildrenToSystem = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const addChildrenToSystem = useCallback(
        async ({
            firstName,
            lastName,
            dateOfBirth,
            fatherName,
            parentId,
            schoolId,
        }: AddChildrenToSystemParams): Promise<ApiResponse<AddChildrenToSystemResponse>> => {
            const requestData = {
                firstName,
                lastName,
                dateOfBirth,
                fatherName: fatherName || null,
                parentId,
                schoolId,
            };

            try {
                console.log('Adding child to system:', requestData);

                const response = await api.post<AddChildrenToSystemResponse>(
                    "/api/Children/AddChildren",
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

                console.error("Add children error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while adding child",
                };
            }
        },
        [api]
    );

    return addChildrenToSystem;
};


export const useAddChildGrade = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const addChildGrade = useCallback(
        async ({
            childId,
            schoolGradeSectionId,
            statusId = 1, // Default to active
        }: AddChildGradeParams): Promise<ApiResponse<AddChildGradeResponse>> => {
            const requestData = {
                childId,
                schoolGradeSectionId,
                statusId,
            };

            try {
                console.log('Adding child to grade section:', requestData);

                const response = await api.post<AddChildGradeResponse>(
                    "/api/School/AddChildGrade", // Based on your .NET endpoint
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

                console.error("Add child grade error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while adding child to grade",
                };
            }
        },
        [api]
    );

    return addChildGrade;
};