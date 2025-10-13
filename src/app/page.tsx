import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const supported = ['ru', 'uz', 'en'] as const

function pick(acc: string | null) {
  if (!acc) return 'ru'
  const prefs = acc.split(',').map(x => x.split(';')[0].trim().slice(0, 2))
  for (const p of prefs) if ((supported as readonly string[]).includes(p)) return p
  return 'ru'
}

export default async function Root() {
  const h = await headers()
  const acc = h.get('accept-language')
  const locale = pick(acc)
  redirect(`/${locale}`)
}
