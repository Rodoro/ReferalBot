import { apiClient } from '@/shared/lib/utils/api-client';

export type DailyStat = {
    date: string;
    agentName: string;
    pointName: string;
    newClients: number;
    songGenerations: number;
    trialGenerations: number;
    purchasedSongs: number;
    poemOrders: number;
    videoOrders: number;
};

export async function getDailyStats(): Promise<DailyStat[]> {
    return apiClient.get('/statistics/daily');
}

export async function getDailyStatsByAgent(id: number): Promise<DailyStat[]> {
    return apiClient.get(`/statistics/agent/${id}/daily`);
}

export async function getDailyStatsBySalesPoint(id: number): Promise<DailyStat[]> {
    return apiClient.get(`/statistics/sales-point/${id}/daily`);
}