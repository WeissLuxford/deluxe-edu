import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export default async function FreeMockTestPage({ 
  params 
}: { 
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const course = await prisma.course.findUnique({
    where: { slug: 'free-mock-test-online' },
    include: {
      lessons: { orderBy: { order: 'asc' }, take: 1 }
    }
  })

  if (!course || course.lessons.length === 0) {
    redirect(`/${locale}/courses`)
  }

  const firstLesson = course.lessons[0]
  redirect(`/${locale}/free-mock-test/${firstLesson.slug}`)
}