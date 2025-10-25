import { prisma } from '@/lib/db'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'


export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t('courses.title')}</h1>
      {courses.length === 0 && <div className="opacity-70">{t('courses.empty')}</div>}
      <ul className="grid gap-4">
        {courses.map(c => {
          const tt = c.title as any
          const title = tt?.[locale] ?? tt?.ru ?? tt?.en ?? tt?.uz ?? c.slug
          const price = (c.priceCents / 100).toFixed(2)
          return (
            <li key={c.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-semibold">{title}</div>
                <div className="text-sm opacity-70">/{c.slug}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-lg">{price}</div>
                <Link href={`/${locale}/courses/${c.slug}`} className="px-3 py-2 border rounded">Open</Link>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
