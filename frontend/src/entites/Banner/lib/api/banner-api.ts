import { apiClient } from '@/shared/lib/utils/api-client'
import { Banner } from '../../types/banner'

export const bannerApi = {
    getAll(): Promise<Banner[]> {
        return apiClient.get('/banners')
    },
    create(data: Partial<Banner>): Promise<Banner> {
        return apiClient.post('/banners', data)
    },
}