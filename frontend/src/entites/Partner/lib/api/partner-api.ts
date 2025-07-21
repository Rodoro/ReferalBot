import { apiClient } from '@/shared/lib/utils/api-client'

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

export async function getAgentPartners(agentId: number): Promise<PartnerWithOutlets[]> {
    return apiClient.get(`/sales-point/agent/${agentId}/outlets`)
}

export async function getPartnerOutlets(partnerId: number): Promise<Outlet[]> {
    return apiClient.get(`/sales-outlet/partner/${partnerId}`)
}