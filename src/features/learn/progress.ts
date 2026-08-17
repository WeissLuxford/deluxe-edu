import { prisma } from '@/lib/db'
import { localized } from '@/lib/localized'
import { resolvePublicAsset } from '@/lib/publicAsset'

export type LessonStep = 'video' | 'conspect' | 'test'
export type LessonStatus = 'done' | 'current' | 'locked'

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
}

export type TreeModule = {
  id: string
  title: string
  description: string
  index: number
  locked: boolean
  total: number
  done: number
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
  modules: TreeModule[]
  total: number
  done: number
  percent: number
  completed: boolean
  current: { moduleId: string; lessonSlug: string; lessonTitle: string } | null
}

export type ResumeTarget = {
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

const STEP_VALUES: LessonStep[] = ['video', 'conspect', 'test']

function stepsOf(lesson: { hasVideo: boolean; hasConspect: boolean; hasTest: boolean }): LessonStep[] {
  const steps: LessonStep[] = []
  if (lesson.hasVideo) steps.push('video')
  if (lesson.hasConspect) steps.push('conspect')
  if (lesson.hasTest) steps.push('test')
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

  const flat = moduleSource.flatMap(m => m.lessons)
  const currentLesson = flat.find(l => !progressByLesson.get(l.id)?.passed) ?? null
  const currentIndex = currentLesson ? flat.findIndex(l => l.id === currentLesson.id) : flat.length

  let cursor = 0
  const modules: TreeModule[] = moduleSource.map((m, moduleIndex) => {
    const lessons: TreeLesson[] = m.lessons.map(lesson => {
      const position = cursor++
      const row = progressByLesson.get(lesson.id)
      const passed = Boolean(row?.passed)
      const status: LessonStatus = passed ? 'done' : position === currentIndex ? 'current' : 'locked'

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
        blockedByTitle:
          status === 'locked' && currentLesson ? localized(currentLesson.title, locale) : null
      }
    })

    return {
      id: m.id,
      title: localized(m.title, locale),
      description: localized(m.description, locale),
      index: moduleIndex + 1,
      locked: lessons.length > 0 && lessons.every(l => l.status === 'locked'),
      total: lessons.length,
      done: lessons.filter(l => l.passed).length,
      lessons
    }
  })

  const total = flat.length
  const done = flat.filter(l => progressByLesson.get(l.id)?.passed).length
  const currentModule = modules.find(m => m.lessons.some(l => l.status === 'current')) ?? null

  return {
    courseId: course.id,
    slug: course.slug,
    title: localized(course.title, locale),
    description: localized(course.description, locale),
    level: course.level,
    coverUrl: resolvePublicAsset(course.coverUrl),
    plan: enrollment.plan || 'BASIC',
    enrollmentId: enrollment.id,
    modules,
    total,
    done,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    completed: total > 0 && done === total,
    current:
      currentLesson && currentModule
        ? {
            moduleId: currentModule.id,
            lessonSlug: currentLesson.slug,
            lessonTitle: localized(currentLesson.title, locale)
          }
        : null
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

export function resumeFromTree(tree: CourseTree): ResumeTarget | null {
  const target = tree.current
    ? findLesson(tree, tree.current.lessonSlug)
    : lastCompleted(tree)

  if (!target) return null

  const { module, lesson } = target
  const step = lesson.lastStep && lesson.steps.includes(lesson.lastStep) ? lesson.lastStep : null

  return {
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
