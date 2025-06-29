import { apiClient } from '@/shared/lib/utils/api-client'
import { Banner } from '../../types/banner'

export const bannerApi = {
    getAll(): Promise<Banner[]> {
        return apiClient.get('/banners')
    },
    create(data: FormData): Promise<Banner> {
        return apiClient.post('/banners', data)
    },
    get(id: number): Promise<Banner> {
        return apiClient.get(`/banners/${id}`)
    },
    update(id: number, data: FormData): Promise<Banner> {
        return apiClient.request(`/banners/${id}`, { method: 'PUT', body: data })
    },
    delete(id: number): Promise<void> {
        return apiClient.delete(`/banners/${id}`)
    },
    duplicate(id: number): Promise<Banner> {
        return apiClient.post(`/banners/${id}/duplicate`)
    },
}