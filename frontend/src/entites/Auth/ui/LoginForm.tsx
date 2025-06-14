'use client'
import React, { useEffect } from 'react'
import AuthWrapper from './AuthWraper'
import { Button } from '@/shared/ui/form/button'
import { TypographyH3 } from '@/shared/ui/typography/TypographyH3'
import { FaTelegram } from 'react-icons/fa6'
// import { authApi } from '../lib/api/auth.api'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../lib/hooks/useAuth'
import { toast } from 'sonner'

export default function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const { login } = useAuth()

    const token = searchParams.get('key')

    async function auth(token: string) {
        try {
            await login(token)
            toast.success('Успешная авторизация')
            router.push('/')
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Ошибка авторизации'
            )
        }
    }

    useEffect(() => {
        if (!token) return
        // authApi.loginByToken(token).then(() => {
        //     router.replace('/')
        // }).catch(console.error)  
        auth(token)
    }, [token, router])

    return (
        <AuthWrapper
        // heading="Вход"
        >
            <TypographyH3 className='text-center' text={'Перейдите в телеграмм для подверждения регистрации. Вы должны сперва зарегитрироватся по данной Вам ссылке от сотрудника'} />
            <a target="_blank" href={process.env.NEXT_PUBLIC_REFBOT + '?start'} rel="noopener noreferrer">
                <Button
                    type="submit"
                    className="mt-8 w-full"
                >
                    <FaTelegram /> Войти
                </Button>
            </a>
        </AuthWrapper>
    )
}
