import { apiClient } from '@/shared/lib/utils/api-client'

export const authApi = {
    loginByToken: async (token: string) => {
        return apiClient.get(`/session/login-telegram?token=${token}`)
    }
}