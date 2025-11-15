// services/performanceServices.tsx
import { ApiResponse } from '@/models/ApiBaseInterfaces';
import useApiInstance from './apiClient';

export interface GetMyPerformanceParams {
    startDate?: string;
    endDate?: string;
}

export interface PerformanceData {
    agentId: number;
    agentName: string;
    periodStart: string;
    periodEnd: string;
    assignedParentsCount: number;
    totalActivitiesCount: number;
    paymentCollectedCount: number;
    paymentAttemptedCount: number;
    successRate: number;
    totalCommissionsEarned: number;
    totalAmountCollected: number;
    commissionPercentage: number;
    averageCollectionAmount: number;
    performanceGrade: string;
}

export type GetMyPerformanceResponseData = ApiResponse<PerformanceData>;

export const useGetMyPerformance = () => {
    const apiInstance = useApiInstance();

    const getMyPerformance = async (
        params?: GetMyPerformanceParams
    ): Promise<PerformanceData> => {
        const queryParams = new URLSearchParams();

        if (params?.startDate) {
            queryParams.append('StartDate', params.startDate);
        }
        if (params?.endDate) {
            queryParams.append('EndDate', params.endDate);
        }

        const queryString = queryParams.toString();
        const url = `/api/CollectingAgent/GetMyPerformance${queryString ? `?${queryString}` : ''}`;

        const response = await apiInstance.get<any>(url);

        // The API returns data at root level, not nested
        const data = response.data;

        return {
            agentId: data.agentId,
            agentName: data.agentName,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
            assignedParentsCount: data.assignedParentsCount,
            totalActivitiesCount: data.totalActivitiesCount,
            paymentCollectedCount: data.paymentCollectedCount,
            paymentAttemptedCount: data.paymentAttemptedCount,
            successRate: data.successRate,
            totalCommissionsEarned: data.totalCommissionsEarned,
            totalAmountCollected: data.totalAmountCollected,
            commissionPercentage: data.commissionPercentage,
            averageCollectionAmount: data.averageCollectionAmount,
            performanceGrade: data.performanceGrade,
        };
    };

    return { getMyPerformance };
};

export const getPerformanceGradeColor = (grade: string) => {
    switch (grade) {
        case 'Excellent':
            return '#10b981'; // green
        case 'Bon':
            return '#3b82f6'; // blue
        case 'Moyen':
            return '#f59e0b'; // amber
        case 'Faible':
            return '#f97316'; // orange
        case 'Très Faible':
            return '#ef4444'; // red
        default:
            return '#6b7280'; // gray
    }
};

export const getPerformanceGradeIcon = (grade: string) => {
    switch (grade) {
        case 'Excellent':
            return 'trophy';
        case 'Bon':
            return 'thumbs-up';
        case 'Moyen':
            return 'hand-right';
        case 'Faible':
            return 'trending-down';
        case 'Très Faible':
            return 'warning';
        default:
            return 'help-circle';
    }
};
