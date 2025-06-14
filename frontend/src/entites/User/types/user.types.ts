export interface User {
    id: number

    avatar: string
    displayName: string
    telegramId: string
    telegramTeg: string

    role: RoleType
}

export enum RoleType { 'STAFF', 'AGENT', 'SALES_POINT', 'POET', 'VIDEO_EDITOR' }