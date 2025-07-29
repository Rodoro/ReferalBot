'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import QRCodeStyling from 'qr-code-styling'
import { Banner } from '@/entites/Banner/types/banner'
import { bannerApi } from '@/entites/Banner/lib/api/banner-api'
import { defaultQrValues, mapOptions } from '@/entites/QrCode/utils'
import { QrCodePreview } from '@/shared/ui/branding/qr-code-preview'
import { Button } from '@/shared/ui/form/button'
import { Input } from '@/shared/ui/form/input'
import { convertGoogleDriveLink } from '@/shared/lib/utils/drive-link'

interface Props {
    referralLink: string
    outletName: string
}

export default function OutletPromo({ referralLink, outletName }: Props) {
    const [banners, setBanners] = useState<Banner[] | null>(null)

    async function fetchImage(url: string): Promise<Blob> {
        try {
            const base = url.includes('drive.google.com')
                ? convertGoogleDriveLink(url)
                : url
            const apiUrl = `/api/download?url=${encodeURIComponent(base)}`
            const res = await fetch(apiUrl)
            if (!res.ok) throw new Error('download failed')
            return await res.blob()
        } catch {
            throw new Error('Failed to fetch image')
        }
    }

    const safeName = (name: string) =>
        name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '')


    useEffect(() => {
        bannerApi.getAll().then(setBanners)
    }, [])

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink)
    }

    const downloadQr = async () => {
        const qr = new QRCodeStyling(
            mapOptions({
                ...defaultQrValues,
                data: referralLink,
                width: 500,
                height: 500,
            })
        )
        const data = await qr.getRawData('png')
        if (!data) return
        const blob = data instanceof Blob ? data : new Blob([data])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-${safeName(outletName)}.png`
        a.click()
        URL.revokeObjectURL(url)
    }

    async function downloadBanner(b: Banner, withQr: boolean) {
        const imgBlob = await fetchImage(b.imageUrl)
        if (!withQr) {
            const url = URL.createObjectURL(imgBlob)
            trigger(url, `banner-${safeName(outletName)}-${b.id}.png`)
            return
        }
        const imgBitmap = await createImageBitmap(imgBlob)
        const canvas = document.createElement('canvas')
        canvas.width = b.width
        canvas.height = b.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(imgBitmap, 0, 0)
        const qrOptions = { ...defaultQrValues, ...(b.qrCode?.options as object || {}), data: referralLink, width: b.qrSize, height: b.qrSize }
        const qr = new QRCodeStyling(mapOptions(qrOptions))
        const qrData = await qr.getRawData('png')
        if (!qrData) return
        const qrBlob = qrData instanceof Blob ? qrData : new Blob([qrData])
        const qrBitmap = await createImageBitmap(qrBlob)
        ctx.drawImage(qrBitmap, b.qrLeftOffset, b.qrTopOffset, b.qrSize, b.qrSize)
        const finalBlob: Blob = await new Promise(resolve =>
            canvas.toBlob(blob => resolve(blob as Blob), 'image/png')
        )
        const url = URL.createObjectURL(finalBlob)
        trigger(url, `banner-${safeName(outletName)}-${b.id}-qr.png`)
    }

    const trigger = (url: string, name: string) => {
        const a = document.createElement('a')
        a.href = url
        a.download = name
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className='mt-8'>
            <h3 className='text-lg font-semibold mb-4'>Материалы</h3>
            <div className='flex flex-col sm:flex-row gap-2 mb-4 max-w-xl items-center'>
                <Input readOnly value={referralLink} className='flex-1' />
                <Button type='button' onClick={copyLink}>Копировать</Button>
                <Button type='button' onClick={downloadQr}>Скачать QR</Button>
            </div>
            {banners && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {banners.map(b => (
                        <div key={b.id} className='border rounded-md overflow-hidden flex flex-col justify-between'>
                            <div className='relative'>
                                <Image
                                    src={b.imageUrl}
                                    alt='banner'
                                    width={b.width}
                                    height={b.height}
                                    className='w-full h-auto'
                                />
                                <QrCodePreview
                                    qrCode={{
                                        id: 0,
                                        type: '',
                                        data: referralLink,
                                        options: b.qrCode?.options || {},
                                        createdAt: ''
                                    }}
                                    className='absolute'
                                    style={{
                                        top: `${(b.qrTopOffset / b.height) * 100}%`,
                                        left: `${(b.qrLeftOffset / b.width) * 100}%`,
                                        width: `${(b.qrSize / b.width) * 100}%`,
                                        height: `${(b.qrSize / b.height) * 100}%`,
                                    }}
                                />
                            </div>
                            <div className='flex gap-2 p-2'>
                                <Button variant='outline' type='button' onClick={() => downloadBanner(b, true)}>Скачать с QR</Button>
                                <Button variant='outline' type='button' onClick={() => downloadBanner(b, false)}>Без QR</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}