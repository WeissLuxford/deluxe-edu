import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCourseTree } from '@/features/learn/progress'
import { isHardGated } from '@/features/learn/groupGate'
import { ExamPlayer } from '@/features/courses/components/ExamPlayer'

export default async function ModuleExamPage({
  params
}: {
  params: Promise<{ locale: string; slug: string; moduleId: string }>
}) {
  const { locale, slug, moduleId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect(`/${locale}/signin?next=/${locale}/learn/${slug}/exam/${moduleId}`)
  }

  const tree = await getCourseTree(session.user.id, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const mod = tree.modules.find(m => m.id === moduleId)
  if (!mod || !mod.exam) notFound()

  const moduleDone = mod.total > 0 && mod.done === mod.total
  if (!moduleDone) redirect(`/${locale}/learn/${slug}`)

  const exam = await prisma.exam.findUnique({
    where: { id: mod.exam.id },
    select: { id: true, title: true, prompt: true, passingScore: true }
  })
  if (!exam) notFound()

  const priorAttempt = await prisma.examAttempt.findFirst({
    where: { examId: exam.id, userId: session.user.id },
    orderBy: { submittedAt: 'desc' },
    select: { grade: true, correct: true, total: true, reviewStatus: true, reviewNote: true }
  })

  const hardGated = await isHardGated(session.user.id)

  return (
    <div className="lesson-player">
      <header className="lesson-player__head">
        <div className="lesson-player__meta">
          <span className="lesson-player__module">{mod.title}</span>
          <h1 className="lesson-player__title">{mod.exam.title}</h1>
        </div>
      </header>

      <div className="lesson-player__body">
        <ExamPlayer
          examId={exam.id}
          title={mod.exam.title}
          prompt={exam.prompt}
          passingScore={exam.passingScore}
          courseSlug={tree.slug}
          moduleTitle={mod.title}
          hardGated={hardGated}
          priorAttempt={priorAttempt}
          locale={locale}
        />
      </div>
    </div>
  )
}
