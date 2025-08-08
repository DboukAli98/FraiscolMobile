import { ApiResponse } from "@/models/ApiBaseInterfaces";
import { CheckCollectionStatusParams, CheckCollectionStatusResponse, InitiateAirtelCollectionParams, InitiateAirtelCollectionResponse } from "@/models/PaymentsServicesInterfaces";
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
            reference,
            subscriberMsisdn,
            amount,
            callbackUrl,
            InstallmentId
        }: InitiateAirtelCollectionParams): Promise<ApiResponse<InitiateAirtelCollectionResponse>> => {
            const requestData = {
                reference,
                subscriberMsisdn,
                amount,
                callbackUrl,
                InstallmentId
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