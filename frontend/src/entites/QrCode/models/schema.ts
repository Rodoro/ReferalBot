import { z } from 'zod'

const dotTypes = [
    'dots',
    'rounded',
    'classy',
    'classy-rounded',
    'square',
    'extra-rounded',
] as const

const cornerSquareTypes = ['dot', 'square', 'extra-rounded'] as const

const cornerDotTypes = ['dot', 'square'] as const

export const qrCodeSchema = z.object({
    data: z.string().min(1, 'Введите данные'),
    width: z.coerce.number().positive().default(300),
    height: z.coerce.number().positive().default(300),
    type: z.enum(['canvas', 'svg']).default('svg'),
    margin: z.coerce.number().nonnegative().default(0),
    image: z.string().optional().or(z.literal('')),
    errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
    dotColor: z.string().default('#000000'),
    dotType: z.enum(dotTypes).default('square'),
    backgroundColor: z.string().default('#ffffff'),
    cornersSquareType: z.enum(cornerSquareTypes).default('extra-rounded'),
    cornersSquareColor: z.string().default('#000000'),
    cornersDotType: z.enum(cornerDotTypes).default('square'),
    cornersDotColor: z.string().default('#000000'),
    imageSize: z.coerce.number().min(0).max(1).default(0.4),
    imageMargin: z.coerce.number().nonnegative().default(0),
    hideBackgroundDots: z.boolean().default(false),
    crossOrigin: z.string().default('anonymous')
})

export type QrCodeFormValues = z.infer<typeof qrCodeSchema>