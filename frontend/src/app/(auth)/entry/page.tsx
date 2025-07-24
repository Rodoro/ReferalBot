import Entry from '@/entites/Auth/ui/Entry'
import { Suspense } from 'react'

export async function generateMetadata() {
    return {
        title: 'Вход',
    }
}

export default function page() {
    return (
        <Suspense>
            <Entry />
        </Suspense>
    )
}