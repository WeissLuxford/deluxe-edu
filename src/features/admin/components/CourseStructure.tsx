import Link from 'next/link'
import { ChevronUp, ChevronDown, Clock, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { deleteLesson, moveLesson } from '@/features/admin/actions'
import {
  deleteModule,
  moveModule,
  assignLessonToModule
} from '@/features/admin/moduleActions'
import { ActionButton } from './ActionButton'
import { DeleteButton } from './DeleteButton'
import { ModuleTitle } from './ModuleTitle'
import { localized } from '@/lib/localized'

type Lesson = {
  id: string
  slug: string
  title: unknown
  order: number
  hasVideo: boolean
  hasConspect: boolean
  hasTest: boolean
  videoUrl: string | null
  durationMin: number | null
  moduleId: string | null
  _count: { Assignment: number }
}

type Module = {
  id: string
  title: unknown
  description?: unknown
  order: number
  lessons: Lesson[]
  exam?: { id: string } | null
}

const ru = (value: unknown) => localized(value, 'ru') || '—'

function LessonRow({
  lesson,
  locale,
  index,
  total,
  modules
}: {
  lesson: Lesson
  locale: string
  index: number
  total: number
  modules: Module[]
}) {
  const others = modules.filter(m => m.id !== lesson.moduleId)

  return (
    <li className="struct-lesson">
      <div className="struct-lesson__order">
        <ActionButton
          action={moveLesson.bind(null, lesson.id, 'up')}
          disabled={index === 0}
          title="Выше"
          className="order-btn"
        >
          <ChevronUp size={13} />
        </ActionButton>
        <span className="order-num">{index + 1}</span>
        <ActionButton
          action={moveLesson.bind(null, lesson.id, 'down')}
          disabled={index === total - 1}
          title="Ниже"
          className="order-btn"
        >
          <ChevronDown size={13} />
        </ActionButton>
      </div>

      <div className="struct-lesson__main">
        <Link href={`/${locale}/admin/lessons/${lesson.id}`} className="struct-lesson__title">
          {ru(lesson.title)}
        </Link>
        <span className="struct-lesson__slug">{lesson.slug}</span>
      </div>

      <div className="struct-lesson__badges">
        {lesson.durationMin ? (
          <span className="badge">
            <Clock size={11} /> {lesson.durationMin} мин
          </span>
        ) : null}
        {lesson.hasVideo && (
          <span className={lesson.videoUrl ? 'badge badge-success' : 'badge badge-warning'}>
            {lesson.videoUrl ? 'видео' : 'видео не задано'}
          </span>
        )}
        {lesson.hasConspect && <span className="badge">конспект</span>}
        {lesson.hasTest && (
          <span className={lesson._count.Assignment > 0 ? 'badge badge-success' : 'badge badge-warning'}>
            {lesson._count.Assignment > 0 ? 'тест' : 'тест без вопросов'}
          </span>
        )}
      </div>

      <div className="struct-lesson__actions">
        {others.length > 0 && (
          <div className="struct-move">
            <span>в модуль:</span>
            {others.map(m => (
              <ActionButton
                key={m.id}
                action={assignLessonToModule.bind(null, lesson.id, m.id)}
                title={`Перенести в «${ru(m.title)}»`}
                className="struct-move__btn"
              >
                {m.order + 1}
              </ActionButton>
            ))}
          </div>
        )}

        <DeleteButton
          action={deleteLesson.bind(null, lesson.id)}
          confirmText={`Удалить урок «${ru(lesson.title)}» вместе с тестом и прогрессом студентов?`}
          variant="icon"
          title="Удалить урок"
        />
      </div>
    </li>
  )
}

export function CourseStructure({
  locale,
  courseId,
  modules,
  orphans
}: {
  locale: string
  courseId: string
  modules: Module[]
  orphans: Lesson[]
}) {
  return (
    <div className="struct">
      {modules.map((module, moduleIndex) => (
        <section key={module.id} className="struct-module">
          <header className="struct-module__head">
            <div className="struct-module__order">
              <ActionButton
                action={moveModule.bind(null, module.id, 'up')}
                disabled={moduleIndex === 0}
                title="Выше"
                className="order-btn"
              >
                <ChevronUp size={14} />
              </ActionButton>
              <span className="order-num">{moduleIndex + 1}</span>
              <ActionButton
                action={moveModule.bind(null, module.id, 'down')}
                disabled={moduleIndex === modules.length - 1}
                title="Ниже"
                className="order-btn"
              >
                <ChevronDown size={14} />
              </ActionButton>
            </div>

            <ModuleTitle module={module} />

            <span className="struct-module__count">{module.lessons.length} урок(ов)</span>

            <div className="struct-module__actions">
              <Link
                href={`/${locale}/admin/courses/${courseId}/modules/${module.id}/exam`}
                className={module.exam ? 'badge badge-success' : 'badge badge-warning'}
              >
                <ClipboardCheck size={11} />
                {module.exam ? 'экзамен модуля' : 'экзамен не задан'}
              </Link>
              <Link
                href={`/${locale}/admin/courses/${courseId}/lessons/new?module=${module.id}`}
                className="btn btn-secondary btn-sm"
              >
                Добавить урок
              </Link>
              <DeleteButton
                action={deleteModule.bind(null, module.id)}
                confirmText={`Удалить модуль «${ru(module.title)}»?`}
                variant="icon"
                title="Удалить модуль"
              />
            </div>
          </header>

          {module.lessons.length === 0 ? (
            <p className="struct-empty">
              В модуле нет уроков. Пустой модуль студенту не показывается.
            </p>
          ) : (
            <ul className="struct-lessons">
              {module.lessons.map((lesson, index) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  locale={locale}
                  index={index}
                  total={module.lessons.length}
                  modules={modules}
                />
              ))}
            </ul>
          )}
        </section>
      ))}

      {orphans.length > 0 && (
        <section className="struct-module struct-module--orphans">
          <header className="struct-module__head">
            <AlertTriangle size={16} />
            <h4 className="struct-module__title">Уроки вне модулей</h4>
            <span className="struct-module__count">{orphans.length}</span>
          </header>

          <p className="struct-empty">
            Эти уроки студент увидит в конце программы отдельным блоком. Перенесите их в модуль.
          </p>

          <ul className="struct-lessons">
            {orphans.map((lesson, index) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                locale={locale}
                index={index}
                total={orphans.length}
                modules={modules}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
