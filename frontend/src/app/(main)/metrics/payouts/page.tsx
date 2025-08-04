import { PayoutTable } from '@/entites/Payout/ui/PayoutTable';
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2';
import Header from '@/widgets/ui/layouts/Header/Header';

export async function generateMetadata() {
    return {
        title: 'Выплаты',
    };
}

export default function Page() {
    return (
        <>
            <Header
                breadcrumbs={[
                    { label: 'Метрики', href: '/metrics' },
                    { label: 'Выплаты', isCurrent: true },
                ]}
            />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-[1860px]">
                <TypographyH2 text="Выплаты" className="mb-4" />
                <PayoutTable />
            </main>
        </>
    );
}