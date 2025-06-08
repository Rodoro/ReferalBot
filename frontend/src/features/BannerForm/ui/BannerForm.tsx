'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bannerSchema, BannerFormValues } from '../model/schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { bannerApi } from '@/entites/Banner/lib/api/banner-api'
import { toast } from 'sonner'

export default function BannerForm() {
    const router = useRouter()
    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            imageUrl: '',
            qrTopOffset: 0,
            qrLeftOffset: 0,
            qrSize: 100,
        },
    })

    const imageUrl = form.watch('imageUrl')
    const qrTop = form.watch('qrTopOffset')
    const qrLeft = form.watch('qrLeftOffset')
    const qrSize = form.watch('qrSize')

    async function onSubmit(data: BannerFormValues) {
        await bannerApi.create(data)
        toast.success('Баннер создан')
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
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-3 gap-2">
                    <FormField
                        control={form.control}
                        name="qrTopOffset"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Отступ сверху</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                                <FormLabel>Отступ слева</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                                <FormLabel>Размер</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {imageUrl && (
                    <div className="relative border p-2 w-fit">
                        <Image src={imageUrl} alt="preview" width={500} height={300} />
                        <div
                            className="bg-black/50 text-white flex items-center justify-center"
                            style={{ position: 'absolute', top: qrTop, left: qrLeft, width: qrSize, height: qrSize }}
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