import { apiClient } from '@/shared/lib/utils/api-client'

export type ArchitectureUser = {
    chatId: string
    username?: string | null
    songGenerations: number
    textGenerations: number
}

export type ArchitectureOutlet = {
    id: number
    name: string
    verified: boolean
    users: ArchitectureUser[]
    userCount: number
    songGenerations: number
    textGenerations: number
}

export type ArchitecturePartner = {
    id: number
    fullName: string
    outlets: ArchitectureOutlet[]
    userCount: number
    songGenerations: number
    textGenerations: number
}

export type ArchitectureAgent = {
    id: number
    fullName: string
    partners: ArchitecturePartner[]
    userCount: number
    songGenerations: number
    textGenerations: number
}

export async function getArchitecture(): Promise<ArchitectureAgent[]> {
    return apiClient.get('/statistics/architecture')
}