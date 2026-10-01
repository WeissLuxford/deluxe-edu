import { redirect } from 'next/navigation'

// The lookup lives on /results, as drawn on the design canvas.
export default async function CertificateLookupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/results#certificate`)
}
