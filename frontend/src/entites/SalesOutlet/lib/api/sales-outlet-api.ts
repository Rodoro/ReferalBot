import { apiClient } from '@/shared/lib/utils/api-client'
import { OutletType, SalesOutlet } from '../../types/sales-outlet'

export interface CreateSalesOutletDto {
    partnerId: number
    type?: OutletType
    name?: string
    telegramId?: string
    address?: string
    link?: string
    description?: string
}

export const salesOutletApi = {
    create(data: CreateSalesOutletDto): Promise<SalesOutlet> {
        return apiClient.post('/sales-outlet', data)
    },
}