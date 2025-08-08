//Airtel Collection Request
export interface InitiateAirtelCollectionParams {
    reference: string;
    subscriberMsisdn: string;
    amount: number;
    callbackUrl: string;
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
