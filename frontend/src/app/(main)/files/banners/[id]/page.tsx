import Header from '@/widgets/ui/layouts/Header/Header'

export const metadata = { title: 'Редактировать баннер' }

export default function Page() {
    return (
        <>
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', href: '/files/banners' }, { label: 'Редактировать', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                TODO
            </main>
        </>
    )
}