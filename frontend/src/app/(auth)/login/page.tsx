import LoginForm from '@/entites/Auth/ui/LoginForm'
import { Suspense } from 'react'

export async function generateMetadata() {
    return {
        title: 'Вход',
    }
}

export default function page() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}