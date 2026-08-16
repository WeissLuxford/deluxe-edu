import { redirect } from 'next/navigation'

export default async function FreeLessonPage({ 
  params 
}: { 
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  redirect(`/${locale}/trial-lesson`)
}