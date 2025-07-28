'use client'

import { useEffect, useState } from 'react'
import { getPartnerOutlets, Outlet } from '../lib/api/partner-api'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import { cn } from '@/shared/lib/utils/utils'
import { OutletTypeIcon } from '@/entites/SalesOutlet/ui/OutletTypeIcon'
import { salesOutletApi } from '@/entites/SalesOutlet/lib/api/sales-outlet-api'
import { Button } from '@/shared/ui/form/button'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/shared/ui/overlay/ConfirmModal'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function PartnerOutletsTable({ partnerId, className }: { partnerId: number; className?: string }) {
    const [data, setData] = useState<Outlet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        getPartnerOutlets(partnerId)
            .then(setData)
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [partnerId])

    async function handleDelete(id: number) {
        try {
            await salesOutletApi.delete(id)
            setData((prev) => prev.filter((o) => o.id !== id))
            toast.success('Точка продажи удалена')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        } catch (e: any) {
            toast.error('Не удалось удалить точку продажи')
        }
    }

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <div className={cn('w-full rounded-md border overflow-auto', className)}>
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="bg-muted font-medium">
                        <TableHead>Точка продажи</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((o) => (
                        <TableRow
                            key={o.id}
                            className={cn(o.verified ? 'bg-green-50' : 'bg-red-50', 'cursor-pointer hover:bg-muted/50')}
                            onClick={() => router.push(`/sales-point/outlets/${o.id}`)}
                        >
                            <TableCell className="px-2 flex items-center gap-2 p-4">
                                {o.type && <OutletTypeIcon type={o.type} className="h-4 w-4" />}
                                {o.name}
                            </TableCell>
                            <TableCell className="px-2 text-right">
                                <ConfirmModal
                                    heading="Удалить точку продажи?"
                                    message="Это действие нельзя отменить"
                                    onConfirm={() => handleDelete(o.id)}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </ConfirmModal>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}