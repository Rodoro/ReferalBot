'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partnerSchema, PartnerFormValues } from '../model/schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { useEffect } from 'react'
import { getPartnerByUser, updatePartnerByUser } from '../lib/api/partner-api'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/form/select'

export default function PartnerForm({ userId }: { userId?: number }) {
    const form = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerSchema),
        defaultValues: {
            fullName: '',
            city: '',
            inn: '',
            phone: '',
            businessType: 'ИП',
            bik: '',
            account: '',
            bankName: '',
            bankKs: '',
        },
    })

    useEffect(() => {
        if (!userId) return
        getPartnerByUser(userId).then(partner => {
            form.reset({
                fullName: partner.fullName ?? '',
                city: partner.city ?? '',
                inn: partner.inn ?? '',
                phone: partner.phone ?? '',
                businessType: partner.businessType ?? '',
                bik: partner.bik ?? '',
                account: partner.account ?? '',
                bankName: partner.bankName ?? '',
                bankKs: partner.bankKs ?? '',
            })
        })
    }, [userId, form])

    function onSubmit(values: PartnerFormValues) {
        if (!userId) return
        updatePartnerByUser(userId, values).then(() => {
            toast.success('Данные сохранены')
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 max-w-md">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Город</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="inn" render={({ field }) => (
                    <FormItem>
                        <FormLabel>ИНН</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="businessType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Тип бизнеса</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ИП">ИП</SelectItem>
                                    <SelectItem value="Самозанятый">Самозанятый</SelectItem>
                                    <SelectItem value="ООО">ООО</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="bik" render={({ field }) => (
                    <FormItem>
                        <FormLabel>БИК</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="account" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Расчётный счёт</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="bankName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Банк</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="bankKs" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Корр. счёт</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="mt-2">Сохранить</Button>
            </form>
        </Form>
    )
}