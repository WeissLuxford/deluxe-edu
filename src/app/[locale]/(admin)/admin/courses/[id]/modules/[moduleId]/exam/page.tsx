import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { saveExam, deleteExam } from '@/features/admin/examActions'
import { TestBuilder } from '@/features/admin/components/TestBuilder'
import { LocaleTabsProvider } from '@/features/admin/components/LocaleTabs'
import { localized } from '@/lib/localized'
import { requireAdmin } from '@/features/admin/requireAdmin'

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
  await requireAdmin(locale)

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { id: true, title: true } },
      lessons: { select: { id: true }, orderBy: { order: 'asc' } },
      exam: true
    }
  })

  if (!mod || mod.courseId !== id) notFound()

  return (
    <div className="space-y-6">
      <Link href={`/${locale}/admin/courses/${id}`} className="text-sm" style={{ color: 'var(--muted)' }}>
        ← К курсу
      </Link>

      <h2 className="text-xl font-semibold" style={{ color: 'var(--fg)' }}>
        Контрольная: {localized(mod.title, 'ru') || 'без названия'}
      </h2>

      <div className="hint">
        Контрольная показывается студенту после того, как он пройдёт все {mod.lessons.length}{' '}
        урок(ов) этого модуля. Результат автоматически считается сервером и в любом случае уходит
        учителю студента (если он состоит в группе) на разбор.
      </div>

      <LocaleTabsProvider>
        <TestBuilder
          kind="exam"
          save={saveExam.bind(null, moduleId)}
          remove={deleteExam.bind(null, moduleId)}
          initialTitle={toLocalized(mod.exam?.title)}
          initialPassingScore={mod.exam?.passingScore ?? 70}
          initialQuestions={toBuilderQuestions(mod.exam?.prompt, mod.exam?.answerKey)}
          hasExisting={Boolean(mod.exam)}
        />
      </LocaleTabsProvider>
    </div>
  )
}
