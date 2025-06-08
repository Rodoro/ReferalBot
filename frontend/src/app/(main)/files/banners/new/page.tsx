import Header from '@/widgets/ui/layouts/Header/Header'
import BannerForm from '@/features/BannerForm/ui/BannerForm'

export const metadata = { title: 'Новый баннер' }

export default function Page() {
    return (
        <>
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', href: '/files/banners' }, { label: 'Новый', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <BannerForm />
            </main>
        </>
    )
}