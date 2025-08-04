import { apiClient } from '@/shared/lib/utils/api-client';

export type Payout = {
    type: string;
    fullName: string;
    inn: string;
    bik: string | null;
    bankName: string | null;
    account: string | null;
    paymentPurpose: string;
};

export async function getPayouts(month?: number, year?: number): Promise<Payout[]> {
    const params = month && year ? `?month=${month}&year=${year}` : '';
    return apiClient.get(`/statistics/payouts${params}`);
}