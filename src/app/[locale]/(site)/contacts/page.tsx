import { permanentRedirect } from 'next/navigation'

// "About" and "Contacts" are one page on the design canvas.
export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  permanentRedirect(`/${locale}/about`)
}
