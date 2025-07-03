import { apiClient } from '@/shared/lib/utils/api-client'
import { QrCodeFormValues } from '../../models/schema'
import { QrCode } from '../../types/qr-code'

export const qrCodeApi = {
    getMain(): Promise<QrCode | null> {
        return apiClient.get('/qr-code/main')
    },
    updateMain(data: QrCodeFormValues): Promise<QrCode> {
        return apiClient.put('/qr-code/main', data)
    },
}