// src/app/[locale]/free-lesson/page.tsx
import { redirect } from 'next/navigation'

export default async function FreeLessonPage({ 
  params 
}: { 
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Редирект на новую страницу trial-lesson
  redirect(`/${locale}/trial-lesson`)
}