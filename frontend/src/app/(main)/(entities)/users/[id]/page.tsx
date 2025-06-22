import Header from '@/widgets/ui/layouts/Header/Header'
import { userApi } from '@/entites/User/lib/api/user.api'
import { getUserRoles } from '@/entites/User/types/user.types'
import { TypographyH2 } from '@/shared/ui/typography/TypographyH2'
import { TypographyP } from '@/shared/ui/typography/TypographyP'
import { Badge } from '@/shared/ui/branding/badge'

export const metadata = { title: 'Пользователь' }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await userApi.get(Number(id))

    return (
        <>
            <Header breadcrumbs={[{ label: 'Администрирование', href: '/' }, { label: 'Пользователи', href: '/users' }, { label: user.displayName, isCurrent: true }]} />
            <main className="flex flex-col gap-4 p-8 max-w-7xl">
                <TypographyH2 text={user.displayName} />
                <TypographyP text={`ID: ${user.telegramId}`} />
                <div className="flex flex-wrap gap-1">
                    {getUserRoles(user).map(r => (
                        <Badge key={r} variant="outline">
                            {r}
                        </Badge>
                    ))}
                </div>
            </main>
        </>
    )
}