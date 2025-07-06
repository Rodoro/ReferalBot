import Header from '@/widgets/ui/layouts/Header/Header'
import BannersGrid from '@/widgets/ui/BannersGrid/BannersGrid'

export const metadata = { title: 'Баннеры' }

export default async function Page() {
    return (
        <>
            {/*TODO: статистика по переходам по qr кодам на банерах 
            TODO: подлнять днс на минио
                TODO: Копирование настроек для qr кодов
                TODO: Больше возможностей редактирование qr кодов
            */}
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'Баннеры', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <BannersGrid />
            </main>
        </>
    )
}