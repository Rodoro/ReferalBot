"use client"

import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { QrCode } from '@/entites/QrCode/types/qr-code'
import { defaultQrValues, mapOptions } from '@/entites/QrCode/utils'
import { cn } from '@/shared/lib/utils/utils'

interface QrCodePreviewProps {
    qrCode: QrCode | null | undefined
    className?: string
    style?: React.CSSProperties
}

export function QrCodePreview({ qrCode, className, style }: QrCodePreviewProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = ref.current
        if (!container) return
        const size = Math.round(container.offsetWidth)
        const options = {
            ...defaultQrValues,
            ...(qrCode?.options as Record<string, unknown> || {}),
            data: qrCode?.data ?? defaultQrValues.data,
            width: size,
            height: size,
        }
        const instance = new QRCodeStyling(mapOptions(options))
        container.innerHTML = ''
        instance.append(container)
        const child = container.firstElementChild as HTMLElement | null
        if (child) {
            child.style.width = '100%'
            child.style.height = '100%'
        }
        return () => {
            container.innerHTML = ''
        }
    }, [qrCode])

    return <div ref={ref} className={cn(className)} style={style} />
}