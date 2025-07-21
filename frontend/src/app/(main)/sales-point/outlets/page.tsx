'use client'

import PartnerOutletsTable from '@/entites/Partner/ui/PartnerOutletsTable'
import { useCurrentUser } from '@/entites/User/lib/hooks/useCurrentUser'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

export default function Page() {
    const { user } = useCurrentUser()
    const partnerId = user?.sales?.id

    return (
        <>
            <Header breadcrumbs={[{ label: 'Партнёр', href: '/sales-point/metrics' }, { label: 'Точки продажи', isCurrent: true }]} />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-8 max-w-[1440px]">
                <TypographyH2 text='Мои точки продажи' className='mb-4' />
                {partnerId ? (
                    <PartnerOutletsTable partnerId={partnerId} />
                ) : (
                    <div className='p-4 text-red-500'>Нет данных</div>
                )}
            </main>
        </>
    )
}