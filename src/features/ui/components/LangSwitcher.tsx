'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const locales = ['ru','uz','en']

export default function LangSwitcher() {
  const pathname = usePathname() || '/'
  const parts = pathname.split('/')
  const current = locales.includes(parts[1]) ? parts[1] : 'ru'
  const hrefFor = (l: string) => {
    const p = [...parts]
    if (locales.includes(p[1])) p[1] = l
    else p.splice(1, 0, l)
    return p.join('/') || '/'
  }
  return (
    <div className="fixed top-4 right-4 flex gap-2">
      {locales.map(l => (
        <Link
          key={l}
          href={hrefFor(l)}
          className={l === current ? 'px-3 py-1 rounded border' : 'px-3 py-1 rounded border opacity-70 hover:opacity-100'}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
