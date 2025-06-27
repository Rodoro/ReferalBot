import { TypographyH2 } from '@/shared/ui/typography/TypographyH2';
import { TypographyP } from '@/shared/ui/typography/TypographyP';
import Header from '@/widgets/ui/layouts/Header/Header'

export const metadata = { title: 'Главная' }

export default function Home() {
  return (
    <>
      <Header breadcrumbs={[{ label: 'Главная', isCurrent: true }]} />
      <main className="flex flex-1 flex-col pb-4 pt-0 px-8 max-w-7xl gap-4">
        <TypographyH2 text='Главная' />
        <TypographyP text='Чтобы перейти на нужную страницу, воспользуйтесь меню в левом верхнем углу страницы и выберите соответствующий пункт.' />
      </main>
    </>
  );
}
