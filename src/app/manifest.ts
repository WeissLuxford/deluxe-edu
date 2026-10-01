import type { MetadataRoute } from 'next'

// "Add to home screen" on Android and desktop Chrome. Opening from the home
// screen lands on / and the middleware sends the person to their language.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Highgate',
    short_name: 'Highgate',
    description: 'Online English school: short lessons, clear explanations and a real teacher.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f4f1fa',
    theme_color: '#f4f1fa',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }
}
