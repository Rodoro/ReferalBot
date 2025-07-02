import QrCodeForm from "@/entites/QrCode/ui/QrCodeForm"
import Header from "@/widgets/ui/layouts/Header/Header"

export const metadata = { title: 'QR коды' }

export default function Page() {
    return (
        <>
            <Header breadcrumbs={[{ label: 'Файлы', href: '/files' }, { label: 'QR коды', isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-[1440px]">
                <QrCodeForm />
            </main>
        </>
    )
}