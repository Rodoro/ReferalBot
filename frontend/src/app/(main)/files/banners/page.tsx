import Header from '@/widgets/ui/layouts/Header/Header'
import Link from 'next/link'
import { Button } from '@/shared/ui/form/button'
import BannersGrid from '@/widgets/ui/BannersGrid/BannersGrid'
import ButtonExport from '@/entites/Banner/ui/ButtonExport'

export const metadata = { title: 'Баннеры' }

export default function Page() {
    return (
        <>
            {/* TODO: Экспорт в эксель, 
            TODO: сопировать настройки и вставка насатроек, 
            TODO: статистика по переходам по qr кодам на банерах */}
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <div className='flex gap-2 w-full'>
                    <Link href="/files/banners/new" className='min-w-56'><Button className='w-full'>Добавить</Button></Link>
                    <ButtonExport />
                </div>
                <BannersGrid />
            </main>
        </>
    )
}