import { redirect } from 'next/navigation'

// The test used to be one page per section; it is a single flow now.
export default async function LegacyLevelTestSection({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/level-test`)
}
