
import { Card } from '@/shared/ui/overlay/card'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import { TypographyP } from '@/shared/ui/typography/TypographyP'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

export async function generateMetadata() {
    return {
        title: 'Сотрудники',
    }
}

export default function page() {
    return (
        <>
            <Header
                breadcrumbs={[
                    { label: "Adminchik", href: "/adminchik" },
                    { label: "Сотрудники", isCurrent: true }
                ]}
            />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-8 max-w-7xl gap-4">
                <TypographyH2 text='Сотрудники' />
                <TypographyP className='' text='Все сотрудники которые зарегистрированы в сети Adminchik' />
                <Card>
                    <UserTable />
                </Card>
            </main>
        </>
    )
}
