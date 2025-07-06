import { apiClient } from '@/shared/lib/utils/api-client'

export type ArchitectureUser = {
    chatId: string
    username?: string | null
}

export type ArchitectureOutlet = {
    id: number
    name: string
    users: ArchitectureUser[]
}

export type ArchitecturePartner = {
    id: number
    fullName: string
    outlets: ArchitectureOutlet[]
}

export type ArchitectureAgent = {
    id: number
    fullName: string
    partners: ArchitecturePartner[]
}

export async function getArchitecture(): Promise<ArchitectureAgent[]> {
    return apiClient.get('/statistics/architecture')
}