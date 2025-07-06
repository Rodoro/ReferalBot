'use client'

import { useEffect, useState } from 'react'
import {
    getArchitecture,
    ArchitectureAgent,
} from '../lib/api/architecture-api'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/shared/ui/form/collapsible'
import { ChevronRight } from 'lucide-react'
import { Skeleton } from '@/shared/ui/branding/skeleton'

export function ArchitectureTree() {
    const [data, setData] = useState<ArchitectureAgent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getArchitecture()
            .then(setData)
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <ul className="space-y-2">
            {data.map((agent) => (
                <li key={agent.id}>
                    <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2">
                            <ChevronRight className="transition-transform data-[state=open]:rotate-90" />
                            <span className="font-medium">{agent.fullName}</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-6 mt-1">
                            <ul className="space-y-1">
                                {agent.partners.map((partner) => (
                                    <li key={partner.id}>
                                        <Collapsible>
                                            <CollapsibleTrigger className="flex items-center gap-2">
                                                <ChevronRight className="transition-transform data-[state=open]:rotate-90" />
                                                <span>{partner.fullName}</span>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="ml-6 mt-1">
                                                <ul className="space-y-1">
                                                    {partner.outlets.map((outlet) => (
                                                        <li key={outlet.id}>
                                                            <Collapsible>
                                                                <CollapsibleTrigger className="flex items-center gap-2">
                                                                    <ChevronRight className="transition-transform data-[state=open]:rotate-90" />
                                                                    <span>{outlet.name}</span>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent className="ml-6 mt-1">
                                                                    <ul className="list-disc ml-4 space-y-1">
                                                                        {outlet.users.map((user) => (
                                                                            <li key={user.chatId} className="break-all">
                                                                                {user.username ? `@${user.username}` : user.chatId}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </li>
                                ))}
                            </ul>
                        </CollapsibleContent>
                    </Collapsible>
                </li>
            ))}
        </ul>
    )
}

export default ArchitectureTree