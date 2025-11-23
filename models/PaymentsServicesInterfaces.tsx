//Airtel Collection Request
export interface MerchandiseItemDto {
    MerchandiseId: number;
    Quantity: number;
}

export interface InitiateAirtelCollectionParams {
    Reference: string;
    SubscriberMsisdn: string;
    Amount: number;
    CallbackUrl: string;
    InstallmentId: number;
    PaymentType: string;
    MerchandiseItems?: MerchandiseItemDto[];
    UserId: string;
}

// Airtel Collection Response
export interface InitiateAirtelCollectionResponse {
    reference: string;
    requestToPayStatus: string;
    status: string;
    error: string | null;
    message: string;
    paymentTransactionId?: number;
}

// Check Collection Status Parameters
export interface CheckCollectionStatusParams {
    transactionId: string;
}

// Transaction Detail interface
export interface TransactionDetail {
    id: string;
    currency: string;
    message: string;
    country: string;
    status: string;
    amount: number;
}

// Check Collection Status Response
export interface CheckCollectionStatusResponse {
    status: string;
    error: string | null;
    message: string | null;
    data: TransactionDetail;
}

// Payment History - School Fees
export interface SchoolFeesPaymentHistoryDto {
    paymentTransactionId: number;
    fK_InstallmentId: number;
    amountPaid: number;
    paidDate: string;
    paymentMethod: string;
    transactionReference: string | null;
    fK_StatusId: number;
    transactionMapId: string | null;
    fK_CollectingAgentId: number | null;
    processedByAgent: boolean;
    fK_UserId: string;
    paymentType: string;
    agentCommission: number | null;
    collectionMethod: string | null;
    agentNotes: string | null;
    childCycleSelectionId: number;
    fK_ChildGradeId: number;
    childGradeId: number;
    fK_ChildId: number;
    fK_SchoolGradeSectionId: number;
    childId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    fatherName: string | null;
    schoolId: number;
    schoolName: string;
    schoolLogo: string | null;
    schoolGradeSectionId: number;
    schoolGradeName: string;
    schoolGradeDescription: string | null;
    installmentId: number;
    installmentAmount: number;
    dueDate: string;
    lateFee: number | null;
    collectingAgentId: number | null;
    agentFirstName: string | null;
    agentLastName: string | null;
    agentPhoneNumber: string | null;
    childFullName: string;
    agentFullName: string | null;
    hasLateFee: boolean;
    totalPaid: number;
}

export interface GetSchoolFeesPaymentHistoryParams {
    UserId: string;
    DateFilter?: string;
    StatusId?: number;
    PaymentType?: string;
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
}

export interface GetSchoolFeesPaymentHistoryResponse {
    data: SchoolFeesPaymentHistoryDto[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: string | null;
    message: string | null;
}

// Payment History - Merchandise
export interface TransactionMerchandiseItemDto {
    transactionItemId: number;
    fK_SchoolMerchandiseId: number;
    schoolMerchandiseName: string;
    schoolMerchandisePrice: number;
    schoolMerchandiseLogo: string | null;
    quantity: number;
    totalAmount: number;
}

export interface MerchandisePaymentHistoryDto {
    paymentTransactionId: number;
    fK_InstallmentId: number | null;
    amountPaid: number;
    paidDate: string;
    paymentMethod: string;
    transactionReference: string | null;
    fK_StatusId: number;
    transactionMapId: string | null;
    fK_CollectingAgentId: number | null;
    processedByAgent: boolean;
    fK_UserId: string;
    paymentType: string;
    agentCommission: number | null;
    collectionMethod: string | null;
    agentNotes: string | null;
    merchandiseItemsJson: string | null;
    totalItems: number;
    totalQuantity: number;
    collectingAgentId: number | null;
    agentFirstName: string | null;
    agentLastName: string | null;
    agentPhoneNumber: string | null;
    agentFullName: string | null;
    merchandiseItems: TransactionMerchandiseItemDto[];
}

export interface GetMerchandisePaymentHistoryParams {
    UserId: string;
    DateFilter?: string;
    StatusId?: number;
    PaymentType?: string;
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
}

export interface GetMerchandisePaymentHistoryResponse {
    data: MerchandisePaymentHistoryDto[] | null;
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    status: string;
    error: string | null;
    message: string | null;
}
