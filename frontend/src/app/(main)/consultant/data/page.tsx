'use client'

import Header from '@/widgets/ui/layouts/Header/Header'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import { useCurrentUser } from '@/entites/User/lib/hooks/useCurrentUser'
import AgentForm from '@/entites/Agent/ui/AgentForm'

export default function Page() {
    const { user } = useCurrentUser()
    const userId = user?.id

    return (
        <>
            <Header breadcrumbs={[{ label: 'Консультант', href: '/consultant/metrics' }, { label: 'Данные', isCurrent: true }]} />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-[1440px]">
                <TypographyH2 text='Данные консультанта' className='mb-4' />
                <AgentForm userId={userId} />
            </main>
        </>
    )
}