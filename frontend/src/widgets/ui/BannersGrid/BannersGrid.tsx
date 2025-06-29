'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    FaEllipsisVertical,
} from 'react-icons/fa6'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import { bannerApi } from '@/entites/Banner/lib/api/banner-api'
import { Banner } from '@/entites/Banner/types/banner'
import { formatDate } from '@/shared/lib/utils/format-date'
import { Card, CardContent, CardFooter } from '@/shared/ui/overlay/card'
import { Button } from '@/shared/ui/form/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/shared/ui/form/dropdown-menu'
import { ConfirmModal } from '@/shared/ui/overlay/ConfirmModal'
import { toast } from 'sonner'
import { Copy, Pencil, Share2, Trash2 } from 'lucide-react'

function BannerCardSkeleton() {
    return (
        <Card className="p-0 max-w-96">
            <CardContent className="p-0">
                <Skeleton className="w-full h-[507px]" />
            </CardContent>
            <CardFooter className="justify-between">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="size-9" />
                    <Skeleton className="size-9" />
                </div>
            </CardFooter>
        </Card>
    )
}

export default function BannersGrid() {
    const [data, setData] = useState<Banner[] | null>(null)
    // const [sizes, setSizes] = useState<Record<number, { w: number; h: number }>>({})

    useEffect(() => {
        bannerApi.getAll().then(setData)
    }, [])

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url)
    }

    const handleDelete = async (id: number) => {
        await bannerApi.delete(id)
        if (data) setData(data.filter(b => b.id !== id))
        toast.success('Баннер удален')
    }

    const handleDuplicate = async (id: number) => {
        const newBanner = await bannerApi.duplicate(id)
        if (data) setData([...data, newBanner])
        toast.success('Баннер продублирован')
    }

    if (data === null) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1184px]">
                {Array.from({ length: 6 }).map((_, i) => (
                    <BannerCardSkeleton key={i} />
                ))}
            </div>
        )
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
                    <Card key={b.id} className="p-0 max-w-96 gap-2">
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
                        <CardFooter className="justify-between pb-2">
                            <span className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</span>
                            <div className="flex gap-2">
                                <Link href={`/files/banners/${b.id}`}>
                                    <Button variant="ghost" size="icon">
                                        <Pencil />
                                    </Button>
                                </Link>
                                <ConfirmModal
                                    heading="Удалить баннер?"
                                    message="Это действие нельзя отменить"
                                    onConfirm={() => handleDelete(b.id)}
                                >
                                    <Button variant="ghost" size="icon">
                                        <Trash2 />
                                    </Button>
                                </ConfirmModal>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <FaEllipsisVertical />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => handleDuplicate(b.id)}>
                                            <Copy /> Дублировать
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => handleCopy(b.imageUrl)}>
                                            <Share2 /> Поделиться
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}