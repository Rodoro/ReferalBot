import { apiClient } from '@/shared/lib/utils/api-client'
import { Agent } from '../../types/agent'

export const agentApi = {
    getByUser(userId: number): Promise<Agent> {
        return apiClient.get(`/agent/user/${userId}`)
    },
    updateByUser(userId: number, data: Partial<Agent>): Promise<Agent> {
        return apiClient.put(`/agent/user/${userId}`, data)
    },
}