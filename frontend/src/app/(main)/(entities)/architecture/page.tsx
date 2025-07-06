import ArchitectureTree from '@/entites/Architecture/ui/ArchitectureTable'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import { TypographyP } from '@/shared/ui/typography/TypographyP'
import Header from '@/widgets/ui/layouts/Header/Header'
import React from 'react'

export const metadata = { title: 'Архитектура' }

// TODO: Увеличить скорость загрузки

export default function Page() {
    return (
        <>
            <Header breadcrumbs={[{ label: 'Администрирование', href: '/' }, { label: 'Архитектура', isCurrent: true }]} />
            <main className='flex flex-1 flex-col pb-4 pt-0 px-8 max-w-7xl gap-4'>
                <TypographyH2 text='Архитектура' />
                <TypographyP text='Здесь отображается структура пользователей, включая консультантов, партнёров и точки продаж. Неверифицированные точки подсвечены красным, а прошедшие проверку — зелёным.' />
                <ArchitectureTree />
            </main>
        </>
    )
}