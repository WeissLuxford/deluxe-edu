import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ru','uz','en']

function getLocale(pathname: string) {
  const seg = pathname.split('/')[1]
  return locales.includes(seg) ? seg : null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const current = getLocale(pathname)
  if (!current) {
    const locale = req.cookies.get('locale')?.value || 'ru'
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
