import { prisma } from '@/lib/db'

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const locales = ['ru', 'uz', 'en']
  const urls = []

  for (const l of locales) {
    urls.push({ url: `${base}/${l}`, changefreq: 'weekly', priority: 0.8 })
    urls.push({ url: `${base}/${l}/courses`, changefreq: 'weekly', priority: 0.7 })
  }

  const courses = await prisma.course.findMany({ select: { slug: true } })
  for (const c of courses) {
    for (const l of locales) {
      urls.push({ url: `${base}/${l}/courses/${c.slug}`, changefreq: 'weekly', priority: 0.7 })
    }
  }

  return urls
}
