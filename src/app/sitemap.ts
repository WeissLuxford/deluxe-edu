import { prisma } from '@/lib/db'
import { teacherSlugs } from '@/features/teachers/registry'
import { SITE_URL } from '@/lib/siteUrl'

// Карта сайта — список того, что мы хотим видеть в поиске. Это whitelist, а не
// обход файлов, поэтому /r/[token] (личные отчёты родителям) и /l/[campaign]
// (адреса объявлений) сюда не попадают в принципе. Дополнительно они закрыты
// в robots.ts и метатегом noindex — три независимых слоя, потому что утечка
// отчёта в индекс необратима.
export default async function sitemap() {
  const base = SITE_URL
  const locales = ['ru', 'uz', 'en']
  const urls = []

  const staticPaths = [
    { path: '', priority: 0.9 },
    { path: '/courses', priority: 0.8 },
    { path: '/teachers', priority: 0.7 },
    { path: '/results', priority: 0.6 },
    // Проверка сертификата — страница доверия: её ищут те, кому показали
    // документ, и она должна находиться.
    { path: '/certificate', priority: 0.6 },
    { path: '/about', priority: 0.5 },
    { path: '/contacts', priority: 0.5 }
  ]

  for (const locale of locales) {
    for (const entry of staticPaths) {
      urls.push({
        url: `${base}/${locale}${entry.path}`,
        changefreq: 'weekly',
        priority: entry.priority
      })
    }

    for (const slug of teacherSlugs()) {
      urls.push({ url: `${base}/${locale}/teachers/${slug}`, changefreq: 'monthly', priority: 0.5 })
    }
  }

  const [courses, news] = await Promise.all([
    prisma.course.findMany({
      where: { published: true, visible: true },
      select: { slug: true, updatedAt: true }
    }),
    prisma.news.findMany({
      where: { published: true },
      select: { slug: true, publishedAt: true, updatedAt: true }
    })
  ])

  for (const course of courses) {
    for (const locale of locales) {
      urls.push({
        url: `${base}/${locale}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changefreq: 'weekly',
        priority: 0.7
      })
    }
  }

  for (const item of news) {
    for (const locale of locales) {
      urls.push({
        url: `${base}/${locale}/news/${item.slug}`,
        lastModified: item.publishedAt ?? item.updatedAt,
        changefreq: 'monthly',
        priority: 0.5
      })
    }
  }

  return urls
}
