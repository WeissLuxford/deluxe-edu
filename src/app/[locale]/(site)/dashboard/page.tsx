import { redirect } from 'next/navigation'

export default async function LegacyDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/learn`)
}
