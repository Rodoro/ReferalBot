'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { salesOutletSchema, SalesOutletFormValues } from '../model/schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/form/select'
import { OutletType } from '../types/sales-outlet'
import { salesOutletApi, UpdateSalesOutletDto } from '../lib/api/sales-outlet-api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    partnerId?: number
    outletId?: number
    initialValues?: SalesOutletFormValues
}

export default function SalesOutletForm({ partnerId, outletId, initialValues }: Props) {
    const router = useRouter()
    const form = useForm<SalesOutletFormValues>({
        resolver: zodResolver(salesOutletSchema),
        defaultValues: initialValues ?? {
            type: OutletType.SELLER,
            name: '',
            telegramId: '',
            address: '',
            link: '',
            description: '',
        },
    })

    const type = form.watch('type')

    async function onSubmit(values: SalesOutletFormValues) {
        if (outletId) {
            const data: UpdateSalesOutletDto = { ...values }
            await salesOutletApi.update(outletId, data)
            toast.success('Точка продажи обновлена')
        } else if (partnerId) {
            await salesOutletApi.create({ partnerId, ...values })
            toast.success('Точка продажи создана')
        }
        router.push('/sales-point/outlets')
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 max-w-md">
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Тип точки</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={OutletType.SELLER}>Продавец</SelectItem>
                                    <SelectItem value={OutletType.SALES_POINT}>Точка продажи</SelectItem>
                                    <SelectItem value={OutletType.INFORMATION_RESOURCE}>Информационный ресурс</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {type === OutletType.SELLER && (
                    <>
                        <FormField control={form.control} name="telegramId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telegram ID</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ФИО</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Адрес</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </>
                )}

                {type === OutletType.SALES_POINT && (
                    <>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Название</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Адрес</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </>
                )}

                {type === OutletType.INFORMATION_RESOURCE && (
                    <>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Название</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="link" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ссылка</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </>
                )}

                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button type="submit" className="mt-2">{outletId ? 'Сохранить' : 'Создать'}</Button>
            </form>
        </Form>
    )
}