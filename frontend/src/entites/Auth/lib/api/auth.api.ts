import { apiClient } from '@/shared/lib/utils/api-client'

export const authApi = {
    loginByToken: async (token: string) => {
        const params = new URLSearchParams();
        params.set('token', token);
        console.log("Final URL:", `/session/login-telegram?${params.toString()}`)
        return apiClient.get(`/session/login-telegram?${params.toString()}`)
    }
}