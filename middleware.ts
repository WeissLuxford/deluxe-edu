import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ru', 'uz', 'en']

function getLocale(pathname: string) {
  const seg = pathname.split('/')[1]
  return locales.includes(seg) ? seg : null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // 👈 ДОБАВЛЕНО: пропускаем API роуты
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  const current = getLocale(pathname)
  
  if (!current) {
    const locale = req.cookies.get('locale')?.value || 'ru'
    const newUrl = new URL(`/${locale}${pathname}`, req.url)
    
    // 👈 ДОБАВЛЕНО: сохраняем query параметры
    newUrl.search = req.nextUrl.search
    
    return NextResponse.redirect(newUrl)
  }
  
  // 👈 ДОБАВЛЕНО: устанавливаем cookie с текущей локалью
  const response = NextResponse.next()
  response.cookies.set('locale', current, { maxAge: 31536000 })
  
  return response
}

export const config = { 
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'] 
}