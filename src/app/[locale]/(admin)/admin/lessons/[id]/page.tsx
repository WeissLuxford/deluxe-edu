import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { updateLesson } from '@/features/admin/actions'
import { saveAssignment, deleteAssignment } from '@/features/admin/assignmentActions'
import { LessonForm } from '@/features/admin/components/LessonForm'
import { AssignmentBuilder } from '@/features/admin/components/AssignmentBuilder'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'

type Localized = { ru: string; uz: string; en: string }

function toLocalized(value: any): Localized {
  if (!value) return { ru: '', uz: '', en: '' }
  if (typeof value === 'string') return { ru: value, uz: '', en: '' }
  return { ru: value.ru ?? '', uz: value.uz ?? '', en: value.en ?? '' }
}

function toBuilderQuestions(prompt: any, answerKey: any) {
  const list = Array.isArray(prompt?.questions) ? prompt.questions : []
  const key = answerKey ?? {}

  return list.map((q: any) => ({
    id: String(q.id),
    type: (['single', 'multiple', 'text'].includes(q.type) ? q.type : 'single') as
      | 'single'
      | 'multiple'
      | 'text',
    question: toLocalized(q.question),
    options: Array.isArray(q.options)
      ? q.options.map((o: any) => ({ value: String(o.value), label: toLocalized(o.label) }))
      : [],
    correct: key[q.id] ?? (q.type === 'multiple' ? [] : '')
  }))
}

export default async function EditLesson({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          modules: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } }
        }
      },
      Assignment: true
    }
  })

  if (!lesson) notFound()

  const assignment = lesson.Assignment[0] ?? null

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/admin/courses/${lesson.course.id}`}
        className="text-sm"
        style={{ color: 'var(--muted)' }}
      >
        ← К курсу
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        {toLocalized(lesson.title).ru || lesson.slug}
      </h2>

      <LocaleTabsProvider>
        <LessonForm
          action={updateLesson.bind(null, id)}
          modules={lesson.course.modules.map(m => ({
            id: m.id,
            label: `${m.order + 1}. ${toLocalized(m.title).ru || 'без названия'}`
          }))}
          lesson={{
            slug: lesson.slug,
            title: toLocalized(lesson.title),
            content: toLocalized(lesson.content),
            order: lesson.order,
            hasVideo: lesson.hasVideo,
            hasConspect: lesson.hasConspect,
            hasTest: lesson.hasTest,
            videoUrl: lesson.videoUrl,
            zoomMeetingId: lesson.zoomMeetingId,
            moduleId: lesson.moduleId,
            coverUrl: lesson.coverUrl,
            durationMin: lesson.durationMin
          }}
          submitLabel="Сохранить урок"
          redirectTo={`/${locale}/admin/courses/${lesson.course.id}`}
        />
      </LocaleTabsProvider>

      <div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)', marginBottom: '0.5rem' }}>
          Тест
        </h3>
        <div className="hint" style={{ marginBottom: '1rem' }}>
          Студент проходит к следующему уроку, только набрав 70% и выше.
        </div>

        <AssignmentBuilder
          save={saveAssignment.bind(null, id)}
          remove={deleteAssignment.bind(null, id)}
          initialTitle={toLocalized(assignment?.title)}
          initialQuestions={toBuilderQuestions(assignment?.prompt, assignment?.answerKey)}
          hasExisting={Boolean(assignment)}
        />
      </div>
    </div>
  )
}
