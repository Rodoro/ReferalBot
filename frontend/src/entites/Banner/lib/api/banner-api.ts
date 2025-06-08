import { apiClient } from '@/shared/lib/utils/api-client'
import { Banner } from '../../types/banner'

export const bannerApi = {
    getAll(): Promise<Banner[]> {
        return apiClient.get('/banners')
    },
    create(data: Partial<Banner>): Promise<Banner> {
        return apiClient.post('/banners', data)
    },
    get(id: number): Promise<Banner> {
        return apiClient.get(`/banners/${id}`)
    },
    update(id: number, data: Partial<Banner>): Promise<Banner> {
        return apiClient.put(`/banners/${id}`, data)
    },
    delete(id: number): Promise<void> {
        return apiClient.delete(`/banners/${id}`)
    },
}