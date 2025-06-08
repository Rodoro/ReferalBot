import Header from '@/widgets/ui/layouts/Header/Header'
import Link from 'next/link'
import { Button } from '@/shared/ui/form/button'
import BannersGrid from '@/widgets/ui/BannersGrid/BannersGrid'

export const metadata = { title: 'Баннеры' }

export default function Page() {
    return (
        <>
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <Link href="/files/banners/new"><Button>Добавить</Button></Link>
                <BannersGrid />
            </main>
        </>
    )
}