import Header from '@/widgets/ui/layouts/Header/Header'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import { salesOutletApi } from '@/entites/SalesOutlet/lib/api/sales-outlet-api'
import SalesOutletForm from '@/entites/SalesOutlet/ui/SalesOutletForm'

// export const metadata = { title: 'Редактировать точку продажи' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const outlet = await salesOutletApi.get(Number(id))

    return (
        <>
            <Header breadcrumbs={[{ label: 'Партнёр', href: '/sales-point/metrics' }, { label: 'Точки продажи', href: '/sales-point/outlets' }, { label: 'Редактировать', isCurrent: true }]} />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-[1440px]">
                <TypographyH2 text='Редактировать точку продажи' className='mb-4' />
                <SalesOutletForm outletId={outlet.id} partnerId={outlet.partnerId} initialValues={{
                    type: outlet.type,
                    name: outlet.name ?? '',
                    telegramId: outlet.telegramId ?? '',
                    address: outlet.address ?? '',
                    link: outlet.link ?? '',
                    description: outlet.description ?? '',
                }} />
            </main>
        </>
    )
}