'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { agentSchema, AgentFormValues } from '../model/schema'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form/form'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { useEffect } from 'react'
import { agentApi } from '../lib/api/agent-api'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/form/select'

export default function AgentForm({ userId }: { userId?: number }) {
    const form = useForm<AgentFormValues>({
        resolver: zodResolver(agentSchema),
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
        agentApi.getByUser(userId).then(agent => {
            form.reset({
                fullName: agent.fullName ?? '',
                city: agent.city ?? '',
                inn: agent.inn ?? '',
                phone: agent.phone ?? '',
                businessType: agent.businessType ?? '',
                bik: agent.bik ?? '',
                account: agent.account ?? '',
                bankName: agent.bankName ?? '',
                bankKs: agent.bankKs ?? '',
            })
        })
    }, [userId, form])

    function onSubmit(values: AgentFormValues) {
        if (!userId) return
        agentApi.updateByUser(userId, values).then(() => {
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