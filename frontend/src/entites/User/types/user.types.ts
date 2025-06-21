export interface User {
    id: number

    avatar?: string | null
    displayName: string
    telegramId: string
    telegramTeg: string

    staff?: unknown | null
    agent?: unknown | null
    sales?: unknown | null
    poet?: unknown | null
    vidio_editor?: unknown | null
}

export enum RoleType {
    STAFF = 'STAFF',
    AGENT = 'AGENT',
    SALES_POINT = 'SALES_POINT',
    POET = 'POET',
    VIDEO_EDITOR = 'VIDEO_EDITOR'
}

export function getUserRoles(user?: User | null): RoleType[] {
    const roles: RoleType[] = []
    if (!user) return roles
    if (user.staff) roles.push(RoleType.STAFF)
    if (user.agent) roles.push(RoleType.AGENT)
    if (user.sales) roles.push(RoleType.SALES_POINT)
    if (user.poet) roles.push(RoleType.POET)
    if (user.vidio_editor) roles.push(RoleType.VIDEO_EDITOR)
    return roles
}