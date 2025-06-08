'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { bannerSchema, BannerFormValues } from '../model/schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { Slider } from '@/shared/ui/form/slider'
import { convertGoogleDriveLink } from '@/shared/lib/utils/drive-link'
import { bannerApi } from '@/entites/Banner/lib/api/banner-api'
import { toast } from 'sonner'

interface BannerFormProps {
    initialValues?: BannerFormValues
    bannerId?: number
}

export default function BannerForm({ initialValues, bannerId }: BannerFormProps) {
    const scaleImg = 6

    const router = useRouter()
    const [imageSize, setImageSize] = useState({ width: 500, height: 300 })
    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: initialValues ?? {
            imageUrl: '',
            qrTopOffset: 0,
            qrLeftOffset: 0,
            qrSize: 100,
        },
    })

    const imageUrl = convertGoogleDriveLink(form.watch('imageUrl'))
    const qrTop = form.watch('qrTopOffset')
    const qrLeft = form.watch('qrLeftOffset')
    const qrSize = form.watch('qrSize')

    // const scale = imageSize.width ? 500 / imageSize.width : 1

    async function onSubmit(data: BannerFormValues) {
        if (bannerId) {
            await bannerApi.update(bannerId, data)
            toast.success('Баннер обновлен')
        } else {
            await bannerApi.create(data)
            toast.success('Баннер создан')
        }
        router.push('/files/banners')
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ссылка на картинку</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onBlur={() => field.onChange(convertGoogleDriveLink(field.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid gap-4">
                    <FormField
                        control={form.control}
                        name="qrTopOffset"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Отступ сверху: {field.value}px</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={0}
                                        max={imageSize.height}
                                        step={10}
                                        value={[field.value]}
                                        onValueChange={v => field.onChange(v[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="qrLeftOffset"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Отступ слева: {field.value}px</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={0}
                                        max={imageSize.width}
                                        step={10}
                                        value={[field.value]}
                                        onValueChange={v => field.onChange(v[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="qrSize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Размер: {field.value}px</FormLabel>
                                <FormControl>
                                    <Slider
                                        min={50}
                                        max={Math.min(imageSize.width, imageSize.height)}
                                        step={10}
                                        value={[field.value]}
                                        onValueChange={v => field.onChange(v[0])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {imageUrl && (
                    <div className="relative border p-2 flex" style={{ width: imageSize.width / scaleImg, height: imageSize.height / scaleImg }}>
                        <Image
                            src={imageUrl}
                            alt="preview"
                            width={100000}
                            height={100000}

                            className='w-full h-full object-contain'
                            onLoadingComplete={img => setImageSize({ width: img.naturalWidth, height: img.naturalHeight })}
                        />
                        <div
                            className="bg-black/50 text-white flex items-center justify-center"
                            style={{ position: 'absolute', top: qrTop / scaleImg, left: qrLeft / scaleImg, width: qrSize / scaleImg, height: qrSize / scaleImg }}
                        >
                            QR
                        </div>
                    </div>
                )}
                <Button type="submit">Сохранить</Button>
            </form>
        </Form>
    )
}