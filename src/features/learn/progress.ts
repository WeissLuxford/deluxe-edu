import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { resolvePublicAsset } from '@/lib/publicAsset'
import { isHardGated } from './groupGate'

export type LessonStep = 'video' | 'conspect' | 'test' | 'dialogue'
export type LessonStatus = 'done' | 'current' | 'locked'
export type ModuleExamStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type TreeLesson = {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  durationMin: number | null
  index: number
  status: LessonStatus
  watched: boolean
  passed: boolean
  lastStep: LessonStep | null
  steps: LessonStep[]
  blockedByTitle: string | null
  blockedByExam: string | null
}

export type TreeModuleExam = {
  id: string
  title: string
  passingScore: number
  attempted: boolean
  grade: number | null
  passed: boolean | null
  reviewStatus: ModuleExamStatus | null
  approved: boolean
  reviewNote: string | null
}

export type TreeModule = {
  id: string
  title: string
  description: string
  index: number
  locked: boolean
  total: number
  done: number
  exam: TreeModuleExam | null
  lessons: TreeLesson[]
}

export type CourseTree = {
  courseId: string
  slug: string
  title: string
  description: string
  level: string
  coverUrl: string | null
  plan: string
  enrollmentId: string
  hardGated: boolean
  modules: TreeModule[]
  total: number
  done: number
  percent: number
  completed: boolean
  current: { moduleId: string; lessonSlug: string; lessonTitle: string } | null
  currentExam: { moduleId: string; examId: string; moduleTitle: string } | null
}

export type ResumeTarget =
  | {
      kind: 'lesson'
      courseSlug: string
      courseTitle: string
      moduleTitle: string
      lessonSlug: string
      lessonTitle: string
      step: LessonStep | null
      percent: number
      done: number
      total: number
      started: boolean
    }
  | {
      kind: 'exam'
      courseSlug: string
      courseTitle: string
      moduleTitle: string
      moduleId: string
      examId: string
      percent: number
      done: number
      total: number
    }

const STEP_VALUES: LessonStep[] = ['video', 'conspect', 'test', 'dialogue']

function stepsOf(lesson: {
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
  hasDialogue: boolean
}): LessonStep[] {
  const steps: LessonStep[] = []
  if (lesson.hasVideo) steps.push('video')
  if (lesson.hasConspect) steps.push('conspect')
  if (lesson.hasTest) steps.push('test')
  if (lesson.hasDialogue) steps.push('dialogue')
  return steps
}

function asStep(value: string | null | undefined): LessonStep | null {
  return STEP_VALUES.includes(value as LessonStep) ? (value as LessonStep) : null
}

export async function getCourseTree(
  userId: string,
  courseSlug: string,
  locale: string
): Promise<CourseTree | null> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: { orderBy: { order: 'asc' }, include: { lessons: { orderBy: { order: 'asc' } } } },
      lessons: { orderBy: { order: 'asc' } }
    }
  })

  if (!course) return null

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId: course.id, status: 'ACTIVE' }
  })

  if (!enrollment) return null

  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: course.lessons.map(l => l.id) } }
  })
  const progressByLesson = new Map(progressRows.map(p => [p.lessonId, p]))

  const moduleIds = course.modules.map(m => m.id)
  const exams = moduleIds.length > 0 ? await prisma.exam.findMany({ where: { moduleId: { in: moduleIds } } }) : []
  const examByModule = new Map(exams.map(e => [e.moduleId, e]))

  const attempts =
    exams.length > 0
      ? await prisma.examAttempt.findMany({
          where: { userId, examId: { in: exams.map(e => e.id) } },
          orderBy: { submittedAt: 'desc' }
        })
      : []
  const latestAttemptByExam = new Map<string, (typeof attempts)[number]>()
  for (const a of attempts) {
    if (!latestAttemptByExam.has(a.examId)) latestAttemptByExam.set(a.examId, a)
  }

  const hardGated = await isHardGated(userId)

  const orphans = course.lessons.filter(l => !l.moduleId)
  const moduleSource = orphans.length
    ? [
        ...course.modules,
        {
          id: `${course.id}-unsorted`,
          title: { ru: 'Без модуля', uz: 'Modulsiz', en: 'Unsorted' },
          description: null,
          order: course.modules.length,
          lessons: orphans
        }
      ]
    : course.modules

  let cursor = 0
  let assignedCurrent = false
  let blocked = false
  let currentLessonTitle: string | null = null
  let currentExam: CourseTree['currentExam'] = null

  const modules: TreeModule[] = moduleSource.map((m, moduleIndex) => {
    const exam = examByModule.get(m.id) ?? null
    const attempt = exam ? (latestAttemptByExam.get(exam.id) ?? null) : null

    const lessons: TreeLesson[] = m.lessons.map(lesson => {
      const position = cursor++
      const row = progressByLesson.get(lesson.id)
      const passed = Boolean(row?.passed)

      let status: LessonStatus
      const gatedWhenLocking = blocked
      if (passed) {
        status = 'done'
      } else if (blocked) {
        status = 'locked'
      } else if (!assignedCurrent) {
        status = 'current'
        assignedCurrent = true
        currentLessonTitle = localized(lesson.title, locale)
      } else {
        status = 'locked'
      }

      return {
        id: lesson.id,
        slug: lesson.slug,
        title: localized(lesson.title, locale),
        coverUrl: resolvePublicAsset(lesson.coverUrl),
        durationMin: lesson.durationMin ?? null,
        index: position + 1,
        status,
        watched: Boolean(row?.watched),
        passed,
        lastStep: asStep(row?.lastStep),
        steps: stepsOf(lesson),
        blockedByTitle: status === 'locked' && !gatedWhenLocking ? currentLessonTitle : null,
        blockedByExam: status === 'locked' && gatedWhenLocking ? (currentExam?.moduleTitle ?? null) : null
      }
    })

    const moduleAllPassed = lessons.length > 0 && lessons.every(l => l.passed)
    const examApproved = attempt?.reviewStatus === 'APPROVED'

    const moduleExam: TreeModuleExam | null = exam
      ? {
          id: exam.id,
          title: localized(exam.title, locale),
          passingScore: exam.passingScore,
          attempted: Boolean(attempt),
          grade: attempt?.grade ?? null,
          passed: attempt ? attempt.grade >= exam.passingScore : null,
          reviewStatus: (attempt?.reviewStatus as ModuleExamStatus | undefined) ?? null,
          approved: examApproved,
          reviewNote: attempt?.reviewNote ?? null
        }
      : null

    // Хард-гейт (учитель должен одобрить) блокирует только тех, кто состоит в
    // группе с куратором — на остальных тарифах это не влияет на доступ,
    // только на статус в exam-карточке (см. TreeModuleExam).
    if (hardGated && exam && moduleAllPassed && !examApproved && !blocked) {
      blocked = true
      currentExam = {
        moduleId: m.id,
        examId: exam.id,
        moduleTitle: localized(m.title, locale)
      }
    }

    return {
      id: m.id,
      title: localized(m.title, locale),
      description: localized(m.description, locale),
      index: moduleIndex + 1,
      locked: lessons.length > 0 && lessons.every(l => l.status === 'locked'),
      total: lessons.length,
      done: lessons.filter(l => l.passed).length,
      exam: moduleExam,
      lessons
    }
  })

  const total = cursor
  const done = modules.reduce((sum, m) => sum + m.done, 0)
  const currentModule = modules.find(m => m.lessons.some(l => l.status === 'current')) ?? null
  const currentLessonRow = currentModule?.lessons.find(l => l.status === 'current') ?? null

  return {
    courseId: course.id,
    slug: course.slug,
    title: localized(course.title, locale),
    description: localized(course.description, locale),
    level: course.level,
    coverUrl: resolvePublicAsset(course.coverUrl),
    plan: enrollment.plan || 'BASIC',
    enrollmentId: enrollment.id,
    hardGated,
    modules,
    total,
    done,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    completed: total > 0 && done === total,
    current:
      currentModule && currentLessonRow
        ? { moduleId: currentModule.id, lessonSlug: currentLessonRow.slug, lessonTitle: currentLessonRow.title }
        : null,
    currentExam
  }
}

export function findLesson(tree: CourseTree, lessonSlug: string) {
  for (const module of tree.modules) {
    const lesson = module.lessons.find(l => l.slug === lessonSlug)
    if (lesson) return { module, lesson }
  }
  return null
}

export function isLessonUnlocked(tree: CourseTree, lessonSlug: string): boolean {
  const found = findLesson(tree, lessonSlug)
  return Boolean(found) && found!.lesson.status !== 'locked'
}

// Для использования вне SSR-страницы (API-роуты), где известен только
// lessonId, а не slug курса. Локаль для проверки доступа не важна — берём
// фиксированную, чтобы не тянуть локаль пользователя в API-роуты.
export async function isLessonAccessible(userId: string, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { courseId: true } })
  if (!lesson) return false

  const course = await prisma.course.findUnique({ where: { id: lesson.courseId }, select: { slug: true } })
  if (!course) return false

  const tree = await getCourseTree(userId, course.slug, 'ru')
  if (!tree) return false

  const found = tree.modules.flatMap(m => m.lessons).find(l => l.id === lessonId)
  return Boolean(found) && found!.status !== 'locked'
}

export function resumeFromTree(tree: CourseTree): ResumeTarget | null {
  if (tree.currentExam) {
    return {
      kind: 'exam',
      courseSlug: tree.slug,
      courseTitle: tree.title,
      moduleTitle: tree.currentExam.moduleTitle,
      moduleId: tree.currentExam.moduleId,
      examId: tree.currentExam.examId,
      percent: tree.percent,
      done: tree.done,
      total: tree.total
    }
  }

  const target = tree.current ? findLesson(tree, tree.current.lessonSlug) : lastCompleted(tree)

  if (!target) return null

  const { module, lesson } = target
  const step = lesson.lastStep && lesson.steps.includes(lesson.lastStep) ? lesson.lastStep : null

  return {
    kind: 'lesson',
    courseSlug: tree.slug,
    courseTitle: tree.title,
    moduleTitle: module.title,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    step,
    percent: tree.percent,
    done: tree.done,
    total: tree.total,
    started: tree.done > 0 || lesson.watched
  }
}

function lastCompleted(tree: CourseTree) {
  for (let i = tree.modules.length - 1; i >= 0; i--) {
    const module = tree.modules[i]
    const lesson = module.lessons[module.lessons.length - 1]
    if (lesson) return { module, lesson }
  }
  return null
}

export async function getEnrolledCourses(userId: string, locale: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: [{ lastVisitedAt: 'desc' }, { createdAt: 'desc' }],
    include: { course: { select: { slug: true } } }
  })

  const trees: CourseTree[] = []
  for (const enrollment of enrollments) {
    const tree = await getCourseTree(userId, enrollment.course.slug, locale)
    if (tree) trees.push(tree)
  }
  return trees
}

export async function getEnrolledCourseIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.enrollment.findMany({
    where: { userId, status: 'ACTIVE' },
    select: { courseId: true }
  })
  return new Set(rows.map(r => r.courseId))
}

export function lessonHref(locale: string, courseSlug: string, lessonSlug: string, step?: LessonStep | null) {
  const base = `/${locale}/learn/${courseSlug}/${lessonSlug}`
  return step ? `${base}?step=${step}` : base
}

export function examHref(locale: string, courseSlug: string, moduleId: string) {
  return `/${locale}/learn/${courseSlug}/exam/${moduleId}`
}
