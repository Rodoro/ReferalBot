import Header from '@/widgets/ui/layouts/Header/Header'
import Link from 'next/link'
import { Button } from '@/shared/ui/form/button'
import BannersGrid from '@/widgets/ui/BannersGrid/BannersGrid'

export const metadata = { title: 'Баннеры' }

export default function Page() {
    return (
        <>
            {/* TODO: Дублировать банеры, 
            TODO: сопировать настройки и вставка насатроек, 
            TODO: скелеты при загрузки картинок, 
            TODO: статистика по переходам по qr кодам на банерах, 
            TODO: отображение qr кодов на банере, 
            TODO: загрузка картиник на minio */}
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <Button className='max-w-56'><Link href="/files/banners/new">Добавить</Link></Button>
                <BannersGrid />
            </main>
        </>
    )
}