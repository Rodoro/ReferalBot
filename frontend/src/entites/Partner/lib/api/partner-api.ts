import { apiClient } from '@/shared/lib/utils/api-client'
import { Partner } from '../../types/partner'

export type Outlet = {
    id: number
    name: string
    address?: string | null
    verified: boolean
}

export type PartnerWithOutlets = {
    id: number
    fullName: string
    outlets: Outlet[]
}

export async function getPartnerByUser(userId: number): Promise<Partner> {
    return apiClient.get(`/sales-point/user/${userId}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePartnerByUser(userId: number, data: any) {
    return apiClient.put(`/sales-point/user/${userId}`, data)
}

export async function getAgentPartners(agentId: number): Promise<PartnerWithOutlets[]> {
    return apiClient.get(`/sales-point/agent/${agentId}/outlets`)
}

export async function getPartnerOutlets(partnerId: number): Promise<Outlet[]> {
    return apiClient.get(`/sales-outlet/partner/${partnerId}`)
}