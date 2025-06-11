import LoginForm from '@/entites/Auth/ui/LoginForm'

export async function generateMetadata() {
    return {
        title: 'Вход',
    }
}

export default function page() {
    return (
        <LoginForm />
    )
}