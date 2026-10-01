// The public address of the site, for every link that leaves the page: sitemap,
// robots, canonical and Open Graph URLs, parent report links, email links.
// Without an env variable production falls back to the real domain — a missing
// variable once put http://localhost:3000 into the live sitemap and report links.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://highgate.uz' : 'http://localhost:3000')
).replace(/\/$/, '')
