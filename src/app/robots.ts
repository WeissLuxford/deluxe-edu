export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /r/ — личные отчёты родителям, /l/ — адреса объявлений. Первые вообще не
      // должны попадать в индекс, вторые дублировали бы главную и тянули бы на
      // себя запросы, по которым должен находиться сайт.
      disallow: ['/api/', '/admin/', '/teacher/', '/r/', '/l/']
    },
    sitemap: `${base}/sitemap.xml`
  }
}
