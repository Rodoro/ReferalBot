'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AiOutlineCopy, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'
import { bannerApi } from '@/entites/Banner/lib/api/banner-api'
import { Banner } from '@/entites/Banner/types/banner'
import { formatDate } from '@/shared/lib/utils/format-date'
import { Card, CardContent, CardFooter } from '@/shared/ui/overlay/card'
import { Button } from '@/shared/ui/form/button'
import { ConfirmModal } from '@/shared/ui/overlay/ConfirmModal'
import { toast } from 'sonner'

export default function BannersGrid() {
    const [data, setData] = useState<Banner[]>([])
    // const [sizes, setSizes] = useState<Record<number, { w: number; h: number }>>({})

    useEffect(() => {
        bannerApi.getAll().then(setData)
    }, [])

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url)
    }

    const handleDelete = async (id: number) => {
        await bannerApi.delete(id)
        setData(data.filter(b => b.id !== id))
        toast.success('Баннер удален')
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1184px]">
            {data.map(b => {
                // TODO: Добавить предпросмотр qr кодов
                // const size = sizes[b.id] || { w: 500, h: 300 }
                // console.log(size)
                // const scaleImg = 3
                // const top = `${(b.qrTopOffset / size.h / scaleImg) * 100}%`
                // const left = `${(b.qrLeftOffset / size.w / scaleImg) * 100}%`
                // const qrW = `${(b.qrSize / size.w / scaleImg) * 100}%`
                // const qrH = `${(b.qrSize / size.h / scaleImg) * 100}%`
                return (
                    <Card key={b.id} className="p-0 max-w-96">
                        <CardContent className="p-0 relative">
                            <Image
                                src={b.imageUrl}
                                alt="banner"
                                width={600}
                                height={300}
                                className="w-full h-auto rounded-t-lg"
                            // onLoadingComplete={img => setSizes(prev => ({ ...prev, [b.id]: { w: img.naturalWidth, h: img.naturalHeight } }))}
                            />
                            {/* <div
                                className="absolute bg-black/50 text-white flex items-center justify-center"
                                style={{ top, left, width: qrW, height: qrH }}
                            >
                                QR
                            </div> */}
                        </CardContent>
                        <CardFooter className="justify-between">
                            <span className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(b.imageUrl)}>
                                    <AiOutlineCopy />
                                </Button>
                                <Link href={`/files/banners/${b.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <AiOutlineEdit />
                                    </Button>
                                </Link>
                                <ConfirmModal
                                    heading="Удалить баннер?"
                                    message="Это действие нельзя отменить"
                                    onConfirm={() => handleDelete(b.id)}
                                >
                                    <Button variant="ghost" size="icon">
                                        <AiOutlineDelete />
                                    </Button>
                                </ConfirmModal>
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}