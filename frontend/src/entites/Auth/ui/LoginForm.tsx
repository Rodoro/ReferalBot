import React from 'react'
import AuthWrapper from './AuthWraper'
import { Button } from '@/shared/ui/form/button'
import { TypographyH3 } from '@/shared/ui/typography/TypographyH3'
import { FaTelegram } from 'react-icons/fa6'

export default function LoginForm() {


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
