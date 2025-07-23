import { ServiceStatsPanel } from '@/entites/Statistics/ui/LogsTable'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

export async function generateMetadata() {
    return {
        title: 'Статистика',
    }
}

export default function page() {
    return (
        <>
            <Header
                breadcrumbs={[
                    { label: "Метрики", href: "/metrics" },
                    { label: "Статистика", isCurrent: true }
                ]}
            />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-[1640px]">
                <TypographyH2 text='Статистика' className='mb-4' />
                <ServiceStatsPanel />
            </main>
        </>
    )
}
