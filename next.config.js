const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

module.exports = withNextIntl({
  images: {
    // Раньше здесь стояло hostname: '**' — это превращало сайт в открытый
    // прокси для картинок: любой мог гонять чужой трафик через наш домен.
    // Перечисляем только те хосты, откуда реально берём изображения.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' }
    ]
  }
})
