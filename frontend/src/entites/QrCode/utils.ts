import { QrCodeFormValues } from './models/schema'
import { Options } from 'qr-code-styling'

export const defaultQrValues: QrCodeFormValues = {
    data: 'https://t.me/podaripesnyu_bot?start=ref_XXXXXXXX',
    width: 300,
    height: 300,
    type: 'svg',
    margin: 0,
    image: '',
    errorCorrectionLevel: 'M',
    dotColor: '#000000',
    dotType: 'square',
    backgroundColor: '#ffffff',
    cornersSquareType: 'extra-rounded',
    cornersSquareColor: '#000000',
    cornersDotType: 'square',
    cornersDotColor: '#000000',
    imageSize: 0.4,
    imageMargin: 0,
    hideBackgroundDots: false,
    crossOrigin: 'anonymous',
}

export function mapOptions(values: QrCodeFormValues): Options {
    return {
        width: values.width,
        height: values.height,
        type: values.type,
        data: values.data,
        margin: values.margin,
        image: values.image || undefined,
        qrOptions: { errorCorrectionLevel: values.errorCorrectionLevel },
        imageOptions: {
            crossOrigin: values.crossOrigin,
            margin: values.imageMargin,
            imageSize: values.imageSize,
            hideBackgroundDots: values.hideBackgroundDots,
        },
        dotsOptions: { color: values.dotColor, type: values.dotType },
        backgroundOptions: { color: values.backgroundColor },
        cornersSquareOptions: {
            type: values.cornersSquareType,
            color: values.cornersSquareColor,
        },
        cornersDotOptions: {
            type: values.cornersDotType,
            color: values.cornersDotColor,
        },
    }
}