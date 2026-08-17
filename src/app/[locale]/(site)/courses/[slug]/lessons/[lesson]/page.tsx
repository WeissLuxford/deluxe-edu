import { redirect } from 'next/navigation'

export default async function LegacyLessonPage({
  params
}: {
  params: Promise<{ locale: string; slug: string; lesson: string }>
}) {
  const { locale, slug, lesson } = await params
  redirect(`/${locale}/learn/${slug}/${lesson}`)
}
