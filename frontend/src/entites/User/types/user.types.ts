export interface User {
    id: number

    avatar: string
    displayName: string
    telegramId: string
    telegramTeg: string

    role: RoleType
}

export enum RoleType {
    STAFF = 'STAFF',
    AGENT = 'AGENT',
    SALES_POINT = 'SALES_POINT',
    POET = 'POET',
    VIDEO_EDITOR = 'VIDEO_EDITOR'
}