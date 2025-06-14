import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']
const PROTECTED_PATHS = ['/', '/dashboard', '/settings']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const session = request.cookies.get('session')?.value

    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    const isPublicPath = PUBLIC_PATHS.some(path =>
        pathname.startsWith(path)
    )

    if (isPublicPath) {
        if (session) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
        return NextResponse.next()
    }

    const isProtectedPath = PROTECTED_PATHS.some(path =>
        pathname.startsWith(path)
    )

    if (isProtectedPath && !session) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}