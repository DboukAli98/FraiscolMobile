// Support Request Enums
export enum SupportRequestType {
    General = 'General',
    Payment = 'Payment',
    Help = 'Help'
}

export enum SupportRequestPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent'
}

export enum SupportRequestDirection {
    PARENT_TO_DIRECTOR = 'PARENT_TO_DIRECTOR',
    PARENT_TO_AGENT = 'PARENT_TO_AGENT',
    AGENT_TO_DIRECTOR = 'AGENT_TO_DIRECTOR'
}

export enum SupportRequestStatus {
    RESOLVED = 14,
    PENDING = 6,
    STALL = 15,
    IN_PROGRESS = 11,
    CANCELLED = 9
}

// Add Support Request DTO
export interface AddSupportRequestToSystemDto {
    Title: string;
    Description: string;
    SupportRequestType: SupportRequestType;
    StatusId: number;
    SchoolId: number;
    ParentId?: number;
    CollectingAgentId?: number;
    DirectorId?: number;
    AssignedToAgentDate?: string;
    Priority: SupportRequestPriority;
    ExpectedResolutionDate?: string;
}

export interface AddSupportRequestInSystemRequestDto {
    RequestDirection: string;
    SupportRequestModel: AddSupportRequestToSystemDto;
}

export interface AddSupportRequestInSystemResponseDto {
    Status: string;
    Message?: string;
    Error?: string;
}

// Get All Support Requests
export interface GetAllSupportRequestsParams {
    Source: string;
    ParentId?: number;
    AgentId?: number;
    SchoolId?: number;
    SupportRequestType?: SupportRequestType;
    FilterByCurrentUser?: boolean;
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
}

export interface SupportRequest {
    supportRequestId: number;
    title: string;
    description: string;
    resultNotes?: string;
    supportRequestType: number;
    fK_StatusId: number;
    status?: {
        statusId: number;
        statusName: string;
    };
    fK_SchoolId: number;
    school?: {
        schoolId: number;
        schoolName: string;
    };
    fK_ParentId?: number;
    parent?: {
        parentId: number;
        firstName: string;
        lastName: string;
    };
    fK_AssignedCollectingAgentId?: number;
    assignedCollectingAgent?: {
        collectingAgentId: number;
        firstName: string;
        lastName: string;
    };
    fK_DirectorId?: number;
    director?: {
        directorId: number;
        firstName: string;
        lastName: string;
    };
    assignedToAgentDate?: string;
    priority: number;
    expectedResolutionDate?: string;
    resolvedDate?: string;
    isAgentAssigned: boolean;
    createdByUserId: string;
    createdOn?: string;
    modifiedOn?: string;
    statusLogs?: any[];
}

export interface GetAllSupportRequestsResponse {
    data: SupportRequest[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}

// Get Support Request By ID
export interface GetSupportRequestByIdParams {
    SupportRequestId: number;
}

export interface SupportRequestStatusLog {
    supportRequestStatusLogId: number;
    fK_SupportRequestId: number;
    fK_StatusId: number;
    message?: string;
    createdAt: string;
}

export interface SupportRequestDetail {
    supportRequestId: number;
    title: string;
    description: string;
    resultNotes?: string;
    supportRequestType: number;
    fK_StatusId: number;
    fK_SchoolId: number;
    schoolName?: string;
    fK_ParentId?: number;
    fK_AssignedCollectingAgentId?: number;
    fK_DirectorId?: number;
    priority: number;
    expectedResolutionDate?: string;
    resolvedDate?: string;
    createdAt?: string;
    updatedAt?: string;
    statusLogs?: SupportRequestStatusLog[];
}

export interface GetSupportRequestByIdResponse {
    data: SupportRequestDetail | null;
    status: string;
    error: any | null;
    message: string | null;
}
