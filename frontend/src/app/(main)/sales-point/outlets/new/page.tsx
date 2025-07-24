'use client'

import Header from '@/widgets/ui/layouts/Header/Header'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import SalesOutletForm from '@/entites/SalesOutlet/ui/SalesOutletForm'
import { useCurrentUser } from '@/entites/User/lib/hooks/useCurrentUser'
import { TypographyP } from '@/shared/ui/typography/TypographyP'

export default function Page() {
    const { user } = useCurrentUser()
    const partnerId = user?.sales?.id

    return (
        <>
            <Header breadcrumbs={[{ label: 'Партнёр', href: '/sales-point/metrics' }, { label: 'Точки продажи', href: '/sales-point/outlets' }, { label: 'Новая', isCurrent: true }]} />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-[1440px]">
                <TypographyH2 text='Новая точка продажи' className='mb-4' />
                <TypographyP
                    className='mb-4 max-w-4xl'
                    text='Тип <b>«Продавец»</b> предназначен для отдельных продавцов: укажите их Telegram ID, ФИО и адрес. <b>«Точка продажи»</b> подходит для физических торговых точек — требуется название и точный адрес. <b>«Информационный ресурс»</b> используется для сайтов и каналов — укажите ссылку и название.'
                />
                {partnerId && <SalesOutletForm partnerId={partnerId} />}
            </main>
        </>
    )
}