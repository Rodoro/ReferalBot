import { apiClient } from '@/shared/lib/utils/api-client';

export type Payout = {
    businessType: string;
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

export async function exportPayouts(
    month: number,
    year: number,
    format: 'xml' | 'json' | 'csv' | 'xlsx',
): Promise<Blob> {
    const params = `?month=${month}&year=${year}&format=${format}`;
    return apiClient.download(`/statistics/payouts/export${params}`);
}

export async function getMyPayouts(month?: number, year?: number): Promise<Payout[]> {
    const params = month && year ? `?month=${month}&year=${year}` : '';
    return apiClient.get(`/statistics/payouts/me${params}`);
}