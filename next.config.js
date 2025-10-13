const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

module.exports = withNextIntl({
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
})
