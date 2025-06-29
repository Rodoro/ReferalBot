'use client'

import { ServiceStatsPanel } from '@/entites/Statistics/ui/LogsTable'
import { useCurrentUser } from '@/entites/User/lib/hooks/useCurrentUser'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

// export async function generateMetadata() {
//     return {
//         title: 'Статистика',
//     }
// }

export default function Page() {
    const { user } = useCurrentUser()
    const salesId = user?.sales?.id

    return (
        <>
            <Header
                breadcrumbs={[
                    { label: "Партнёр", href: "/sales-point/metrics" },
                    { label: "Статистика", isCurrent: true }
                ]}
            />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-8 max-w-[1440px]">
                <TypographyH2 text='Статистика' className='mb-4' />
                {salesId ? (
                    <ServiceStatsPanel mode='salesPoint' id={salesId} showAgentFilter={false} />
                ) : (
                    <div className='p-4 text-red-500'>Нет данных</div>
                )}
            </main>
        </>
    )
}