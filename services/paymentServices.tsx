import { ApiResponse } from "@/models/ApiBaseInterfaces";
import { CheckCollectionStatusParams, CheckCollectionStatusResponse, GetMerchandisePaymentHistoryParams, GetMerchandisePaymentHistoryResponse, GetSchoolFeesPaymentHistoryParams, GetSchoolFeesPaymentHistoryResponse, InitiateAirtelCollectionParams, InitiateAirtelCollectionResponse } from "@/models/PaymentsServicesInterfaces";
import { useCallback } from "react";
import useApiInstance from "./apiClient";

//#region Initiate Airtel Payment

export const useInitiateAirtelCollection = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const initiateAirtelCollection = useCallback(
        async ({
            Reference,
            SubscriberMsisdn,
            Amount,
            CallbackUrl,
            InstallmentId,
            PaymentType,
            MerchandiseItems,
            UserId
        }: InitiateAirtelCollectionParams): Promise<ApiResponse<InitiateAirtelCollectionResponse>> => {
            const requestData = {
                Reference,
                SubscriberMsisdn,
                Amount,
                CallbackUrl,
                InstallmentId,
                PaymentType,
                MerchandiseItems,
                UserId
            };

            try {
                console.log('Initiating Airtel collection:', requestData);

                const response = await api.post<InitiateAirtelCollectionResponse>(
                    "/api/Payments/collect",
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

                console.error("Initiate Airtel collection error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while initiating payment",
                };
            }
        },
        [api]
    );

    return initiateAirtelCollection;
};

//#endregion


//#region  Check Collection Status Service
export const useCheckCollectionStatus = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const checkCollectionStatus = useCallback(
        async ({
            transactionId
        }: CheckCollectionStatusParams): Promise<ApiResponse<CheckCollectionStatusResponse>> => {
            const params = new URLSearchParams({
                TransactionId: transactionId,
            }).toString();

            try {
                console.log('Checking collection status for transaction:', transactionId);

                const response = await api.get<CheckCollectionStatusResponse>(
                    `/api/Payments/status/${transactionId}?${params}`
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

                console.error("Check collection status error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while checking collection status",
                };
            }
        },
        [api]
    );

    return checkCollectionStatus;
};

//#endregion

//#region Get School Fees Payment History
export const useGetSchoolFeesPaymentHistory = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getSchoolFeesPaymentHistory = useCallback(
        async ({
            UserId,
            DateFilter = "ThisMonth",
            StatusId = 8,
            PaymentType = "SCHOOLFEE",
            PageNumber = 1,
            PageSize = 10,
            Search = ""
        }: GetSchoolFeesPaymentHistoryParams): Promise<ApiResponse<GetSchoolFeesPaymentHistoryResponse>> => {
            const params = new URLSearchParams({
                UserId,
                DateFilter,
                StatusId: StatusId.toString(),
                PaymentType,
                PageNumber: PageNumber.toString(),
                PageSize: PageSize.toString(),
                ...(Search && { Search })
            }).toString();

            try {
                console.log('Fetching school fees payment history:', params);

                const response = await api.get<GetSchoolFeesPaymentHistoryResponse>(
                    `/api/Payments/GetSchoolFeesPaymentHistory?${params}`
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

                console.error("Get school fees payment history error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching payment history",
                };
            }
        },
        [api]
    );

    return getSchoolFeesPaymentHistory;
};

//#endregion

//#region Get Merchandise Payment History
export const useGetMerchandisePaymentHistory = () => {
    const api = useApiInstance({
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": "en"
        },
    });

    const getMerchandisePaymentHistory = useCallback(
        async ({
            UserId,
            DateFilter = "ThisMonth",
            StatusId = 8,
            PaymentType = "MERCHANDISEFEE",
            PageNumber = 1,
            PageSize = 10,
            Search = ""
        }: GetMerchandisePaymentHistoryParams): Promise<ApiResponse<GetMerchandisePaymentHistoryResponse>> => {
            const params = new URLSearchParams({
                UserId,
                DateFilter,
                StatusId: StatusId.toString(),
                PaymentType,
                PageNumber: PageNumber.toString(),
                PageSize: PageSize.toString(),
                ...(Search && { Search })
            }).toString();

            try {
                console.log('Fetching merchandise payment history:', params);

                const response = await api.get<GetMerchandisePaymentHistoryResponse>(
                    `/api/Payments/GetMerchandisePaymentHistory?${params}`
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

                console.error("Get merchandise payment history error:", error);

                return {
                    success: false,
                    status: status,
                    data: null,
                    error: errorData || "An error occurred while fetching payment history",
                };
            }
        },
        [api]
    );

    return getMerchandisePaymentHistory;
};

//#endregion