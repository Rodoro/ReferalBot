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
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState(initialValues?.imageUrl ?? '')
    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: initialValues ?? {
            qrTopOffset: 0,
            qrLeftOffset: 0,
            qrSize: 100,
        },
    })

    const qrTop = form.watch('qrTopOffset')
    const qrLeft = form.watch('qrLeftOffset')
    const qrSize = form.watch('qrSize')

    // const scale = imageSize.width ? 500 / imageSize.width : 1

    async function onSubmit(data: BannerFormValues) {
        const formData = new FormData()
        if (file) formData.append('file', file)
        formData.append('qrTopOffset', String(data.qrTopOffset))
        formData.append('qrLeftOffset', String(data.qrLeftOffset))
        formData.append('qrSize', String(data.qrSize))

        if (bannerId) {
            await bannerApi.update(bannerId, formData)
            toast.success('Баннер обновлен')
        } else {
            await bannerApi.create(formData)
            toast.success('Баннер создан')
        }
        router.push('/files/banners')
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
                <FormItem>
                    <FormLabel>Картинка</FormLabel>
                    <FormControl>
                        <div>
                            <Input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    setFile(f);
                                    if (f) setPreview(URL.createObjectURL(f));
                                }}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition"
                            >
                                {file ? (
                                    <p className="text-sm text-black">{"Выбран файл " + file.name}</p>
                                ) : (
                                    "Выберите файл"
                                )}

                            </label>

                        </div>
                    </FormControl>
                </FormItem>
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
                {preview && (
                    <div className="relative border flex" style={{ width: imageSize.width / scaleImg, height: imageSize.height / scaleImg }}>
                        <Image
                            src={preview}
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