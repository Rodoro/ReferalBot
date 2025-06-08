import Header from '@/widgets/ui/layouts/Header/Header'
import BannerForm from '@/features/BannerForm/ui/BannerForm'
import { bannerApi } from '@/entites/Banner/lib/api/banner-api'

interface PageProps { params: { id: string } }

export const metadata = { title: 'Редактировать баннер' }

export default async function Page({ params }: PageProps) {
    const banner = await bannerApi.get(Number(params.id))
    return (
        <>
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', href: '/files/banners' }, { label: 'Редактировать', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <BannerForm initialValues={banner} bannerId={banner.id} />
            </main>
        </>
    )
}