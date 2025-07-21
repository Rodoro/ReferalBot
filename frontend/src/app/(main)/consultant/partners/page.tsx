'use client'

import AgentPartnersTable from '@/entites/Partner/ui/AgentPartnersTable'
import { useCurrentUser } from '@/entites/User/lib/hooks/useCurrentUser'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

export default function Page() {
    const { user } = useCurrentUser()
    const agentId = user?.agent?.id

    return (
        <>
            <Header breadcrumbs={[{ label: 'Консультант', href: '/consultant/metrics' }, { label: 'Партнёры', isCurrent: true }]} />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-8 max-w-[1440px]">
                <TypographyH2 text='Мои партнёры' className='mb-4' />
                {agentId ? (
                    <AgentPartnersTable agentId={agentId} />
                ) : (
                    <div className='p-4 text-red-500'>Нет данных</div>
                )}
            </main>
        </>
    )
}