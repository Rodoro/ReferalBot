'use client'

import { Fragment, useEffect, useState, useMemo } from 'react'
import {
    getArchitecture,
    ArchitectureAgent,
    ArchitecturePartner,
    ArchitectureOutlet,
    ArchitectureUser,
} from '../lib/api/architecture-api'
import { ChevronRight, X } from 'lucide-react'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/shared/ui/branding/table'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'

import { cn } from '@/shared/lib/utils/utils'
import { OutletTypeIcon } from '@/entites/SalesOutlet/ui/OutletTypeIcon'

export function ArchitectureTree({ className }: { className?: string }) {
    const [data, setData] = useState<ArchitectureAgent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedAgents, setExpandedAgents] = useState<Record<number, boolean>>({})
    const [expandedPartners, setExpandedPartners] = useState<Record<number, boolean>>({})
    const [expandedOutlets, setExpandedOutlets] = useState<Record<number, boolean>>({})
    const [search, setSearch] = useState('')

    const totals = useMemo(() => {
        let partnerCount = 0
        let outletCount = 0
        let userCount = 0
        let songGens = 0
        let textGens = 0

        data.forEach(agent => {
            partnerCount += agent.partners.length
            songGens += agent.songGenerations
            textGens += agent.textGenerations
            userCount += agent.userCount

            agent.partners.forEach(p => {
                outletCount += p.outlets.length
            })
        })

        return {
            agents: data.length,
            partners: partnerCount,
            outlets: outletCount,
            users: userCount,
            songGens,
            textGens,
        }
    }, [data])

    const filteredData = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return data
        return data.reduce<ArchitectureAgent[]>((acc, agent) => {
            const agentMatch = agent.fullName.toLowerCase().includes(term)
            const partners = agent.partners.reduce<ArchitecturePartner[]>((pAcc, p) => {
                const partnerMatch = p.fullName.toLowerCase().includes(term)
                const outlets = p.outlets.reduce<ArchitectureOutlet[]>((oAcc, o) => {
                    const outletMatch = o.name.toLowerCase().includes(term)
                    const users = o.users.filter(u => {
                        const login = u.username ? `@${u.username}` : u.chatId
                        return login.toLowerCase().includes(term)
                    })
                    if (users.length || outletMatch) {
                        oAcc.push({ ...o, users })
                    }
                    return oAcc
                }, [])
                if (outlets.length || partnerMatch) {
                    pAcc.push({ ...p, outlets })
                }
                return pAcc
            }, [])
            if (partners.length || agentMatch) {
                acc.push({ ...agent, partners })
            }
            return acc
        }, [])
    }, [data, search])

    function toggleAgent(id: number) {
        setExpandedAgents((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    function togglePartner(id: number) {
        setExpandedPartners((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    function toggleOutlet(id: number) {
        setExpandedOutlets((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    function closeAll() {
        setExpandedAgents({})
        setExpandedPartners({})
        setExpandedOutlets({})
    }

    function renderUser(user: ArchitectureUser) {
        return (
            <>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell className="flex justify-between break-all px-2">
                    <span>{user.username ? `@${user.username}` : user.chatId}</span>
                    <span className="text-xs text-muted-foreground">
                        {user.songGenerations}/{user.textGenerations}
                    </span>
                </TableCell>
            </>
        )
    }

    function renderOutlet(outlet: ArchitectureOutlet) {
        const outletInfo = (
            <TableCell className="text-xs text-muted-foreground">
                {outlet.userCount} пользов.,{' '}
                {outlet.songGenerations + outlet.textGenerations} ген.
            </TableCell>
        )

        const rowStyle = outlet.verified ? 'bg-green-50' : 'bg-red-50'

        if (!outlet.users.length) {
            return (
                <TableRow className={rowStyle}>
                    <TableCell />
                    <TableCell />
                    <TableCell className="px-2 flex items-center gap-2">
                        {outlet.type && <OutletTypeIcon type={outlet.type} className="h-4 w-4" />}
                        {outlet.name}
                    </TableCell>
                    {outletInfo}
                </TableRow>
            )
        }
        return (
            <Fragment>
                <TableRow className={rowStyle}>
                    <TableCell />
                    <TableCell />
                    <TableCell className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => toggleOutlet(outlet.id)}
                            className="flex items-center"
                        >
                            <ChevronRight
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    expandedOutlets[outlet.id] && 'rotate-90'
                                )}
                            />
                        </button>
                        {outlet.type && <OutletTypeIcon type={outlet.type} className="h-4 w-4" />}
                        {outlet.name}
                    </TableCell>
                    {outletInfo}
                </TableRow>
                {expandedOutlets[outlet.id] &&
                    outlet.users.map((user) => (
                        <TableRow key={user.chatId}>{renderUser(user)}</TableRow>
                    ))}
            </Fragment>
        )
    }

    function renderPartner(partner: ArchitecturePartner) {
        const partnerInfo = (
            <>
                <TableCell className="text-xs text-muted-foreground">
                    {partner.outlets.length} точек
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                    {partner.userCount} пользов.,{' '}
                    {partner.songGenerations + partner.textGenerations} ген.
                </TableCell>
            </>
        )

        if (!partner.outlets.length) {
            return (
                <TableRow>
                    <TableCell />
                    <TableCell className="px-2">{partner.fullName}</TableCell>
                    {partnerInfo}
                </TableRow>
            )
        }
        return (
            <Fragment>
                <TableRow>
                    <TableCell />
                    <TableCell className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => togglePartner(partner.id)}
                            className="flex items-center"
                        >
                            <ChevronRight
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    expandedPartners[partner.id] && 'rotate-90'
                                )}
                            />
                        </button>
                        {partner.fullName}
                    </TableCell>
                    {partnerInfo}
                </TableRow>
                {expandedPartners[partner.id] &&
                    partner.outlets.map((outlet) => (
                        <Fragment key={outlet.id}>{renderOutlet(outlet)}</Fragment>
                    ))}
            </Fragment>
        )
    }

    function renderAgent(agent: ArchitectureAgent) {
        const outletCount = agent.partners.reduce(
            (sum, p) => sum + p.outlets.length,
            0,
        )

        const agentInfo = (
            <>
                <TableCell className="text-xs text-muted-foreground">
                    {agent.partners.length} партнёров
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                    {outletCount} точек
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                    {agent.userCount} пользов.,{' '}
                    {agent.songGenerations + agent.textGenerations} ген.
                </TableCell>
            </>
        )

        if (!agent.partners.length) {
            return (
                <TableRow>
                    <TableCell className="font-medium">{agent.fullName}</TableCell>
                    {agentInfo}
                </TableRow>
            )
        }
        return (
            <Fragment>
                <TableRow className="bg-muted/50 font-medium">
                    <TableCell className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => toggleAgent(agent.id)}
                            className="flex items-center"
                        >
                            <ChevronRight
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    expandedAgents[agent.id] && 'rotate-90'
                                )}
                            />
                        </button>
                        {agent.fullName}
                    </TableCell>
                    {agentInfo}
                </TableRow>
                {expandedAgents[agent.id] &&
                    agent.partners.map((partner) => (
                        <Fragment key={partner.id}>{renderPartner(partner)}</Fragment>
                    ))}
            </Fragment>
        )
    }

    useEffect(() => {
        getArchitecture()
            .then(setData)
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <div className={cn('w-full rounded-md border overflow-auto', className)}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 p-2 border-b bg-muted/50 text-sm">
                <span>Консультантов: <span className="font-semibold">{totals.agents}</span></span>
                <span>Партнёров: <span className="font-semibold">{totals.partners}</span></span>
                <span>Точек: <span className="font-semibold">{totals.outlets}</span></span>
                <span>Пользователей: <span className="font-semibold">{totals.users}</span></span>
                <span>Генераций песен: <span className="font-semibold">{totals.songGens}</span></span>
                <span>Генераций текстов: <span className="font-semibold">{totals.textGens}</span></span>
                <Input
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ml-auto w-48"
                />
                <Button size="sm" variant="outline" onClick={closeAll}>
                    <X className="h-4 w-4" /> Закрыть все
                </Button>
            </div>
            <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="bg-muted font-medium">
                        <TableHead className="w-1/4">Консультант</TableHead>
                        <TableHead className="w-1/4">Партнёр</TableHead>
                        <TableHead className="w-1/4">Точка продажи</TableHead>
                        <TableHead className="w-1/4">Пользователь</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.map((agent) => (
                        <Fragment key={agent.id}>{renderAgent(agent)}</Fragment>
                    ))}
                </TableBody>
            </Table>
        </div >
    )
}

export default ArchitectureTree