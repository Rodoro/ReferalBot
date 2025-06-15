import { apiClient } from '@/shared/lib/utils/api-client'
import { Session } from '../../types/session.types'


export const sessionApi = {
    getCurrent: async (): Promise<Session> => {
        return apiClient.get('/session/current')
    },

    getAll: async (): Promise<Session[]> => {
        return apiClient.get('/session')
    },

    terminate: async (sessionId: string): Promise<void> => {
        return apiClient.delete(`/session/${sessionId}`)
    },

    terminateAll: async (): Promise<void> => {
        return apiClient.post('/session/clear')
    },
}