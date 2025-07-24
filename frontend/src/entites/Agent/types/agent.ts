export interface Agent {
    id: number
    userId: number
    fullName: string
    city: string
    inn: string
    phone: string
    businessType: 'ИП' | 'Самозанятый' | 'ООО'
    bik?: string | null
    account?: string | null
    bankName?: string | null
    bankKs?: string | null
    bankDetails: string
    approved: boolean
    contractSigned: boolean
    referralCode?: string | null
    registrationDate: string
}