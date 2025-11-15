import useApiInstance from "./apiClient";

// Enums
export enum CollectingAgentActivityType {
    PaymentCollected = 0,
    PaymentAttempted = 1,
    ParentContact = 2,
    SupportRequestHandled = 3,
    ParentAssigned = 4,
    ParentUnassigned = 5,
    FieldVisit = 6,
    PhoneCall = 7,
    Other = 8,
}

// Activity DTOs
export interface CollectingAgentActivityDto {
    activityId: number;
    collectingAgentId: number;
    agentName: string;
    parentId?: number;
    parentName?: string;
    activityType: CollectingAgentActivityType;
    activityTypeDisplayName: string;
    activityDescription: string;
    notes?: string;
    relatedTransactionId?: number;
    relatedSupportRequestId?: number;
    activityDate: string;
    createdOn: string;
}

// Request DTOs
export interface GetMyActivitiesParams {
    startDate?: string;
    endDate?: string;
    activityType?: CollectingAgentActivityType;
    pageNumber?: number;
    pageSize?: number;
    search?: string;
}

export interface LogActivityParams {
    parentId?: number;
    activityType: CollectingAgentActivityType;
    activityDescription: string;
    notes?: string;
    relatedTransactionId?: number;
    relatedSupportRequestId?: number;
}

// Response DTOs
export interface GetMyActivitiesResponseData {
    data: CollectingAgentActivityDto[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error?: string;
    message?: string;
}

export interface LogActivityResponseData {
    activityId: number;
    status: string;
    error?: string;
    message?: string;
}

// Helper function to get activity type display name
export const getActivityTypeDisplayName = (
    activityType: CollectingAgentActivityType
): string => {
    switch (activityType) {
        case CollectingAgentActivityType.PaymentCollected:
            return "Paiement Collecté";
        case CollectingAgentActivityType.PaymentAttempted:
            return "Tentative de Paiement";
        case CollectingAgentActivityType.ParentContact:
            return "Contact Parent";
        case CollectingAgentActivityType.SupportRequestHandled:
            return "Demande de Support Traitée";
        case CollectingAgentActivityType.ParentAssigned:
            return "Parent Assigné";
        case CollectingAgentActivityType.ParentUnassigned:
            return "Parent Désassigné";
        case CollectingAgentActivityType.FieldVisit:
            return "Visite Terrain";
        case CollectingAgentActivityType.PhoneCall:
            return "Appel Téléphonique";
        case CollectingAgentActivityType.Other:
            return "Autre";
        default:
            return "Inconnu";
    }
};

// Helper function to get activity type icon
export const getActivityTypeIcon = (
    activityType: CollectingAgentActivityType
): string => {
    switch (activityType) {
        case CollectingAgentActivityType.PaymentCollected:
            return "checkmark-circle-outline";
        case CollectingAgentActivityType.PaymentAttempted:
            return "cash-outline";
        case CollectingAgentActivityType.ParentContact:
            return "chatbubble-outline";
        case CollectingAgentActivityType.SupportRequestHandled:
            return "help-circle-outline";
        case CollectingAgentActivityType.ParentAssigned:
            return "person-add-outline";
        case CollectingAgentActivityType.ParentUnassigned:
            return "person-remove-outline";
        case CollectingAgentActivityType.FieldVisit:
            return "location-outline";
        case CollectingAgentActivityType.PhoneCall:
            return "call-outline";
        case CollectingAgentActivityType.Other:
            return "document-text-outline";
        default:
            return "ellipse-outline";
    }
};

// API Hooks
export const useGetMyActivities = () => {
    const apiInstance = useApiInstance();

    return async (params: GetMyActivitiesParams) => {
        try {
            const queryParams = new URLSearchParams();

            if (params.startDate) queryParams.append("StartDate", params.startDate);
            if (params.endDate) queryParams.append("EndDate", params.endDate);
            if (params.activityType !== undefined)
                queryParams.append("ActivityType", params.activityType.toString());
            if (params.pageNumber)
                queryParams.append("PageNumber", params.pageNumber.toString());
            if (params.pageSize)
                queryParams.append("PageSize", params.pageSize.toString());
            if (params.search) queryParams.append("Search", params.search);

            const response = await apiInstance.get<GetMyActivitiesResponseData>(
                `/api/CollectingAgent/GetMyActivities?${queryParams.toString()}`
            );

            return {
                success: response.data.status === "Success",
                data: response.data,
                error: response.data.error,
            };
        } catch (error: unknown) {
            return {
                success: false,
                data: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Impossible de récupérer les activités",
            };
        }
    };
};

export const useLogActivity = () => {
    const apiInstance = useApiInstance();

    return async (params: LogActivityParams) => {
        try {
            const response = await apiInstance.post<LogActivityResponseData>(
                "/api/CollectingAgent/LogActivity",
                params
            );

            return {
                success: response.data.status === "Success",
                data: response.data,
                error: response.data.error,
            };
        } catch (error: unknown) {
            return {
                success: false,
                data: null,
                error:
                    error instanceof Error
                        ? error.message
                        : "Impossible d'enregistrer l'activité",
            };
        }
    };
};
