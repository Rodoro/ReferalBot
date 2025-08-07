import { NextRequest, NextResponse } from 'next/server'

function extractToken(html: string): string | null {
    const m = html.match(/confirm=([a-zA-ZА-Яа-я0-9_-]+)/)
    return m ? m[1] : null
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
        return NextResponse.json({ error: 'invalid url' }, { status: 400 })
    }

    try {
        const target = url
        let res = await fetch(target)
        if (res.status === 403 || res.headers.get('content-type')?.includes('text/html')) {
            const text = await res.text()
            const token = extractToken(text)
            if (token) {
                const base = target.includes('&') ? `${target}&confirm=${token}` : `${target}?confirm=${token}`
                res = await fetch(base)
            } else {
                throw new Error('unable to fetch')
            }
        }
        if (!res.ok) {
            return new NextResponse('failed', { status: res.status })
        }
        const arrayBuffer = await res.arrayBuffer()
        const contentType = res.headers.get('content-type') || 'application/octet-stream'
        return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            }
        })
    } catch {
        return new NextResponse('error', { status: 500 })
    }
}