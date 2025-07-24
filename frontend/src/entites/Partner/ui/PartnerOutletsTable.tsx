'use client'

import { useEffect, useState } from 'react'
import { getPartnerOutlets, Outlet } from '../lib/api/partner-api'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import { cn } from '@/shared/lib/utils/utils'
import { OutletTypeIcon } from '@/entites/SalesOutlet/ui/OutletTypeIcon'

export default function PartnerOutletsTable({ partnerId, className }: { partnerId: number; className?: string }) {
    const [data, setData] = useState<Outlet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getPartnerOutlets(partnerId)
            .then(setData)
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [partnerId])

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <div className={cn('w-full rounded-md border overflow-auto', className)}>
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="bg-muted font-medium">
                        <TableHead>Точка продажи</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((o) => (
                        <TableRow key={o.id} className={o.verified ? 'bg-green-50' : 'bg-red-50'}>
                            <TableCell className="px-2 flex items-center gap-2">
                                {o.type && <OutletTypeIcon type={o.type} className="h-4 w-4" />}
                                {o.name}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}