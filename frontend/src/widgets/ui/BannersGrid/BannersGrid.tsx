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
import { Copy, Pencil, Share2, Trash2, Clipboard } from 'lucide-react'


function BannerCardSkeleton() {
    return (
        <Card className="p-0 max-w-96 gap-0">
            <CardContent className="p-0">
                <Skeleton className="w-full h-[507px]" />
            </CardContent>
            <CardFooter className="justify-between p-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="size-9" />
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

    const handleCopySettings = (b: Banner) => {
        const settings = {
            qrTopOffset: b.qrTopOffset,
            qrLeftOffset: b.qrLeftOffset,
            qrSize: b.qrSize,
            width: b.width,
            height: b.height,
        }
        navigator.clipboard.writeText(JSON.stringify(settings))
        toast.success('Настройки скопированы')
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
                return (
                    <Card key={b.id} className="p-0 max-w-96 gap-0 bg-muted">
                        <CardContent className="p-0 relative">
                            <Image
                                src={b.imageUrl}
                                alt="banner"
                                width={600}
                                height={300}
                                className="w-full h-auto rounded-t-lg"
                            />
                            <div
                                className="absolute bg-black/50 text-white flex items-center justify-center"
                                style={{
                                    top: `${(b.qrTopOffset / b.height) * 100}%`,
                                    left: `${(b.qrLeftOffset / b.width) * 100}%`,
                                    width: `${(b.qrSize / b.width) * 100}%`,
                                    height: `${(b.qrSize / b.height) * 100}%`,
                                }}
                            >
                                QR
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between p-2 bg-white rounded-b-lg">
                            <span className="text-sm pl-2 text-muted-foreground">{formatDate(b.createdAt)}</span>
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
                                        <DropdownMenuItem onSelect={() => handleCopySettings(b)}>
                                            <Clipboard /> Скопировать настройки
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