'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FaTelegram } from 'react-icons/fa6'
import AuthWrapper from './AuthWraper'
import { TypographyH3 } from '@/shared/ui/typography/TypographyH3'
import { Button } from '@/shared/ui/form/button'
import { useAuth } from '../lib/hooks/useAuth'

export default function Entry() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { login } = useAuth()
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
    const token = searchParams.get('key')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            return
        }
        login(token)
            .then(() => {
                setStatus('success')
                setTimeout(() => router.push('/'), 1000)
            })
            .catch(() => setStatus('error'))
    }, [token, router])

    return (
        <AuthWrapper>
            {status === 'pending' && (
                <TypographyH3 className='text-center' text='Пожалуйста, подождите...' />
            )}
            {status === 'success' && (
                <TypographyH3 className='text-center' text='Успешный вход, подождите...' />
            )}
            {status === 'error' && (
                <>
                    <TypographyH3
                        className='text-center'
                        text='Не удалось войти. Вернитесь в бота и нажмите кнопку ещё раз.'
                    />
                    <a target='_blank' href={process.env.NEXT_PUBLIC_REFBOT + '?start'} rel='noopener noreferrer'>
                        <Button className='mt-8 w-full'>
                            <FaTelegram /> Перейти в бота
                        </Button>
                    </a>
                </>
            )}
        </AuthWrapper>
    )
}