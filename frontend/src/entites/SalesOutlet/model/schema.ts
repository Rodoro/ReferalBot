import { z } from 'zod'
import { OutletType } from '../types/sales-outlet'

export const salesOutletSchema = z.object({
    type: z.nativeEnum(OutletType),
    name: z.string().optional().or(z.literal('')),
    telegramId: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    link: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
}).superRefine((val, ctx) => {
    if (val.type === OutletType.SELLER) {
        if (!val.telegramId) ctx.addIssue({ code: 'custom', message: 'Введите telegramId', path: ['telegramId'] })
        if (!val.name) ctx.addIssue({ code: 'custom', message: 'Введите ФИО', path: ['name'] })
        if (!val.address) ctx.addIssue({ code: 'custom', message: 'Введите адрес', path: ['address'] })
    } else if (val.type === OutletType.SALES_POINT) {
        if (!val.name) ctx.addIssue({ code: 'custom', message: 'Введите название', path: ['name'] })
        if (!val.address) ctx.addIssue({ code: 'custom', message: 'Введите адрес', path: ['address'] })
    } else if (val.type === OutletType.INFORMATION_RESOURCE) {
        if (!val.name) ctx.addIssue({ code: 'custom', message: 'Введите название', path: ['name'] })
        if (!val.link) ctx.addIssue({ code: 'custom', message: 'Введите ссылку', path: ['link'] })
    }
})

export type SalesOutletFormValues = z.infer<typeof salesOutletSchema>