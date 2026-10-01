import { SITE_URL } from '@/lib/siteUrl'

export default function robots() {
  const base = SITE_URL
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /r/ — личные отчёты родителям, /l/ — адреса объявлений. Первые вообще не
      // должны попадать в индекс, вторые дублировали бы главную и тянули бы на
      // себя запросы, по которым должен находиться сайт.
      // Every page sits under a language prefix (/ru/admin/…), so list each one.
      disallow: ['/api/', ...['admin', 'teacher', 'r', 'l'].flatMap(area => ['ru', 'uz', 'en'].map(l => `/${l}/${area}/`))]
    },
    sitemap: `${base}/sitemap.xml`
  }
}
