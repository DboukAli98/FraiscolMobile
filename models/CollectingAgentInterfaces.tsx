// Collecting Agent Interfaces

export interface CollectingAgent {
    collectingAgentId: number;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    assignedArea: string;
    commissionPercentage: number;
    oneSignalPlayerId?: string;
    fK_SchoolId: number;
    school?: any;
    fK_StatusId: number;
    status?: any;
    collectingAgentParents?: any[];
    processedTransactions?: any[];
    handledSupportRequests?: any[];
    commissionHistory?: any[];
    fK_UserId: string;
    createdOn: string;
    modifiedOn?: string;
}

export interface CollectingAgentParent {
    collectingAgentParentId: number;
    fK_CollectingAgentId: number;
    collectingAgent: CollectingAgent;
    fK_ParentId: number;
    parent?: any;
    assignedDate: string;
    unassignedDate?: string;
    isActive: boolean;
    assignmentNotes?: string;
    fK_AssignedByDirectorId: number;
    assignedByDirector?: any;
    createdOn: string;
    modifiedOn?: string;
}

// Get Parents Collecting Agents
export interface GetParentsCollectingAgentsParams {
    ParentId: number;
    PageNumber?: number;
    PageSize?: number;
}

export interface GetParentsCollectingAgentsResponse {
    data: CollectingAgentParent[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: any | null;
    message: string | null;
}
