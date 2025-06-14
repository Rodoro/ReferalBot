import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export const useLogout = () => {
    const { logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Вы успешно вышли из аккаунта')
            router.push('/login')
        } catch (error) {
            toast.error('Произошла ошибка при выходе')
            console.error('Logout error:', error)
        }
    }

    return handleLogout
}