export interface SalesOutlet {
    id: number
    partnerId: number
    address: string | null
    name: string
    type: OutletType
    telegramId?: string | null
    link?: string | null
    description?: string | null
    verified: boolean
    referralCode?: string | null
    createdAt: string
}

export enum OutletType {
    SELLER = 'SELLER',
    SALES_POINT = 'SALES_POINT',
    USER = 'USER',
    INFORMATION_RESOURCE = 'INFORMATION_RESOURCE',
}