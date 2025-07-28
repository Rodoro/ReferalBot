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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateSalesOutletDto extends Partial<CreateSalesOutletDto> { }

export const salesOutletApi = {
    create(data: CreateSalesOutletDto): Promise<SalesOutlet> {
        return apiClient.post('/sales-outlet', data)
    },
    update(id: number, data: UpdateSalesOutletDto): Promise<SalesOutlet> {
        return apiClient.put(`/sales-outlet/${id}`, data)
    },
    get(id: number): Promise<SalesOutlet> {
        return apiClient.get(`/sales-outlet/${id}`)
    },
    delete(id: number): Promise<void> {
        return apiClient.delete(`/sales-outlet/${id}`)
    },
}