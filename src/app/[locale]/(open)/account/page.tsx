import { redirect } from 'next/navigation'

// The profile lives in the learning app now (canvas: Account).
export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/learn/account`)
}
