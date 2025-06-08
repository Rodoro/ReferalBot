'use client'
import { Button } from '@/shared/ui/form/button'
import Header from '@/widgets/ui/layouts/Header/Header'
import { useRouter } from 'next/navigation'

export async function generateMetadata() {
    return {
        title: '404',
    }
}

export default function NotFoundPage() {
    const router = useRouter()
    return (
        <>
            <Header
                breadcrumbs={[]}
            />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0 justify-center items-center">
                <span className='mt-8 text-[1.75rem] sm:text-[2rem] xl:text-[2.25rem] leading-[100%]'>404</span>
                <h1 className='mt-3 mb-8 text-[1.75rem] sm:text-[2rem] xl:text-[2.25rem] leading-[100%]'>
                    Страница не найдена
                </h1>
                <span className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2.5 w-full'>
                    <Button size={'lg'} onClick={() => router.push('/')}>
                        На главную
                    </Button>
                    <Button size={'lg'} variant={'secondary'} className='backdrop-blur-xl' onClick={() => router.back()}>
                        Назад
                    </Button>
                </span>

            </main>
        </>
    )
}
