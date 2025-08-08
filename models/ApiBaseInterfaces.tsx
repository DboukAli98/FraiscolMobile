export interface ApiResponse<T = any> {
    success: boolean;
    status: number;
    data: T | null;
    error: any;
}

