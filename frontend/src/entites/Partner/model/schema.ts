import { z } from 'zod'

export const partnerSchema = z.object({
    fullName: z.string().min(1, 'Введите ФИО'),
    city: z.string().min(1, 'Введите город'),
    inn: z.string().min(1, 'Введите ИНН'),
    phone: z.string().min(1, 'Введите телефон'),
    businessType: z.enum(['ИП', 'Самозанятый', 'ООО'], {
        required_error: 'Введите тип бизнеса',
    }),
    bik: z.string().optional().or(z.literal('')),
    account: z.string().optional().or(z.literal('')),
    bankName: z.string().optional().or(z.literal('')),
    bankKs: z.string().optional().or(z.literal('')),
})

export type PartnerFormValues = z.infer<typeof partnerSchema>