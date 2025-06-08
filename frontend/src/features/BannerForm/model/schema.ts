import { z } from 'zod'

export const bannerSchema = z.object({
    imageUrl: z.string().url({ message: 'Введите корректную ссылку' }),
    qrTopOffset: z.coerce.number().nonnegative(),
    qrLeftOffset: z.coerce.number().nonnegative(),
    qrSize: z.coerce.number().positive(),
})

export type BannerFormValues = z.infer<typeof bannerSchema>