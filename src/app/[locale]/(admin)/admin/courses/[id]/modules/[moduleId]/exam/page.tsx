import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { saveExam, deleteExam } from '@/features/admin/examActions'
import { ExamBuilder } from '@/features/admin/components/ExamBuilder'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'
import { localized } from '@/lib/localized'

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

export default async function ModuleExamPage({
  params
}: {
  params: Promise<{ locale: string; id: string; moduleId: string }>
}) {
  const { locale, id, moduleId } = await params

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { id: true, title: true } },
      lessons: { select: { id: true }, orderBy: { order: 'asc' } },
      exam: true
    }
  })

  if (!module || module.courseId !== id) notFound()

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/courses/${id}`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К курсу
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        Контрольная: {localized(module.title, 'ru') || 'без названия'}
      </h2>

      <div className="hint">
        Контрольная показывается студенту после того, как он пройдёт все {module.lessons.length}{' '}
        урок(ов) этого модуля. Результат автоматически считается сервером и в любом случае уходит
        учителю студента (если он состоит в группе) на разбор.
      </div>

      <LocaleTabsProvider>
        <ExamBuilder
          save={saveExam.bind(null, moduleId)}
          remove={deleteExam.bind(null, moduleId)}
          initialTitle={toLocalized(module.exam?.title)}
          initialPassingScore={module.exam?.passingScore ?? 70}
          initialQuestions={toBuilderQuestions(module.exam?.prompt, module.exam?.answerKey)}
          hasExisting={Boolean(module.exam)}
        />
      </LocaleTabsProvider>
    </div>
  )
}
