import Header from '@/widgets/ui/layouts/Header/Header';
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2';
import { MyPayoutTable } from '@/entites/Payout/ui/MyPayoutTable';

export const metadata = { title: 'Выплаты' };

export default function Page() {
    return (
        <>
            <Header breadcrumbs={[{ label: 'Выплаты', isCurrent: true }]} />
            <main className="flex flex-1 flex-col pb-4 pt-0 px-2 sm:px-8 max-w-[1640px]">
                <TypographyH2 text="Выплаты" className="mb-4" />
                <MyPayoutTable />
            </main>
        </>
    );
}