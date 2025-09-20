/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  i18n: { locales: ['ru', 'uz', 'en'], defaultLocale: 'ru' }
}
module.exports = nextConfig
