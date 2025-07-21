'use client'

import { Fragment, useEffect, useState } from 'react'
import { getAgentPartners, PartnerWithOutlets } from '../lib/api/partner-api'
import { ChevronRight } from 'lucide-react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import { cn } from '@/shared/lib/utils/utils'

export default function AgentPartnersTable({ agentId, className }: { agentId: number; className?: string }) {
    const [data, setData] = useState<PartnerWithOutlets[]>([])
    const [expanded, setExpanded] = useState<Record<number, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getAgentPartners(agentId)
            .then(setData)
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [agentId])

    function toggle(id: number) {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <div className={cn('w-full rounded-md border overflow-auto', className)}>
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="bg-muted font-medium">
                        <TableHead className="w-1/2">Партнёр</TableHead>
                        <TableHead className="w-1/2">Точка продажи</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((partner) => (
                        <Fragment key={partner.id}>
                            <TableRow>
                                <TableCell className="flex items-center gap-2">
                                    <button type="button" onClick={() => toggle(partner.id)} className="flex items-center">
                                        <ChevronRight className={cn('h-4 w-4 transition-transform', expanded[partner.id] && 'rotate-90')} />
                                    </button>
                                    {partner.fullName}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {partner.outlets.length} точек
                                </TableCell>
                            </TableRow>
                            {expanded[partner.id] &&
                                partner.outlets.map((o) => (
                                    <TableRow key={o.id} className={o.verified ? 'bg-green-50' : 'bg-red-50'}>
                                        <TableCell />
                                        <TableCell className="px-2">{o.name}</TableCell>
                                    </TableRow>
                                ))}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}