import { apiClient } from '@/shared/lib/utils/api-client'
import { User } from '../../types/user.types'

export const userApi = {
    login: async (token: string): Promise<User> => {
        return apiClient.get('/session/login-telegram?token=' + token)
    },

    logout: async (): Promise<void> => {
        return apiClient.post('/session/logout')
    },

    getCurrent: async (): Promise<User> => {
        return apiClient.get('/user/me')
    },

    getAll: async (): Promise<User[]> => {
        const users = await apiClient.get<User[]>('/user')
        return Promise.all(
            users.map(u =>
                apiClient
                    .get<User>(`/user/user/${u.id}`)
                    .catch(() => u)
            )
        )
    },

    get: async (id: number): Promise<User> => {
        return apiClient.get(`/user/user/${id}`)
    },

    update: async (id: number, data: Partial<User>): Promise<User> => {
        return apiClient.put(`/user/${id}`, data)
    },

    delete: async (id: number): Promise<void> => {
        return apiClient.delete(`/user/${id}`)
    },

    clear: async (id: number): Promise<User> => {
        return apiClient.delete(`/user/clear/${id}`)
    },
}