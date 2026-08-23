import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ru', 'uz', 'en']

function getLocale(pathname: string) {
  const seg = pathname.split('/')[1]
  return locales.includes(seg) ? seg : null
}

function pickFromAcceptLanguage(acceptLanguage: string | null) {
  if (!acceptLanguage) return null
  const prefs = acceptLanguage.split(',').map(x => x.split(';')[0].trim().slice(0, 2))
  return prefs.find(p => locales.includes(p)) ?? null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const current = getLocale(pathname)

  if (!current) {
    const locale =
      req.cookies.get('locale')?.value ||
      pickFromAcceptLanguage(req.headers.get('accept-language')) ||
      'ru'
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url)
    
    newUrl.search = req.nextUrl.search
    
    return NextResponse.redirect(newUrl)
  }
  
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-locale', current)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.cookies.set('locale', current, { maxAge: 31536000 })

  return response
}

export const config = { 
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'] 
}