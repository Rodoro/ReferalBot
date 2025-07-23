
import UserTable from '@/entites/User/ui/UserTable'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import { TypographyP } from '@/shared/ui/typography/TypographyP'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

export async function generateMetadata() {
    return {
        title: 'Пользователи',
    }
}

export default function page() {
    return (
        <>
            <Header
                breadcrumbs={[
                    { label: "Администрирование", href: "/" },
                    { label: "Пользователи", isCurrent: true }
                ]}
            />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-7xl gap-4">
                <TypographyH2 text='Пользователи' />
                <TypographyP className='' text='Все пользователи которые зарегистрированы в сети' />
                <UserTable />
            </main>
        </>
    )
}
