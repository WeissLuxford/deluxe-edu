import { Onest, Playfair_Display } from 'next/font/google'

// next/font downloads these at build time and serves them from our own domain:
// no manual download, no request to Google from the visitor's browser.

export const fontSans = Onest({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-sans',
  display: 'swap'
})

export const fontSerif = Playfair_Display({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  style: ['italic'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
})

export const fontVariables = `${fontSans.variable} ${fontSerif.variable}`
