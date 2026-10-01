import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { authOptions } from '@/lib/auth'
import { Reveal } from '@/design/components/Reveal'
import { PanelGrid } from '@/design/layout/AppShell'
import { CourseModules, type ModuleView } from '@/features/courses/CourseModules'
import { CallbackForm } from '@/features/leads/CallbackForm'
import { CourseHead } from '@/features/learn/CourseHead'
import { getCourseTree } from '@/features/learn/progress'
import s from '@/features/learn/program.module.css'

type Props = { params: Promise<{ locale: string; slug: string }> }

export default async function CourseAboutPage({ params }: Props) {
  const { locale, slug } = await params
  const session = await getServerSession(authOptions)
  const tree = await getCourseTree(session!.user.id, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  const [t, tu] = await Promise.all([getTranslations({ locale, namespace: 'programPage' }), getTranslations({ locale, namespace: 'ui' })])
  const plan = tree.plan === 'FREE' ? 'BASIC' : tree.plan

  const modules: ModuleView[] = tree.modules.map(m => ({
    id: m.id,
    title: m.title,
    meta: t('moduleStatus', { done: m.done, total: m.total }),
    lessons: m.lessons.map(l => ({ id: l.id, title: l.title, minutes: l.durationMin ? t('min', { min: l.durationMin }) : '' }))
  }))

  return (
    <PanelGrid>
      <CourseHead tree={tree} locale={locale} tab="about" />

      {tree.description && (
        <Reveal>
          <p className={s.aboutText}>{tree.description}</p>
        </Reveal>
      )}

      <Reveal delay={60} className={s.facts}>
        <div className={s.fact}>
          <span className={s.factNum}>{tree.total}</span>
          <span className={s.factLabel}>{t('aboutLessons', { count: tree.total })}</span>
        </div>
        <div className={s.fact}>
          <span className={s.factNum}>{tree.modules.length}</span>
          <span className={s.factLabel}>{t('aboutModules', { count: tree.modules.length })}</span>
        </div>
        <div className={s.fact}>
          <span className={s.factNum}>{tu(`plans.${plan}.name`)}</span>
          <span className={s.factLabel}>{t('aboutPlan')}</span>
        </div>
      </Reveal>

      <section className={s.outline}>
        <h2 className={s.h2}>{t('outline')}</h2>
        <CourseModules modules={modules} />
      </section>

      {tree.plan !== 'DELUXE' && (
        <Reveal className={s.upgrade} as="section">
          <span id="upgrade" className={s.upgradeTitle}>{t('upgrade')}</span>
          <span className={s.upgradeText}>{t('upgradeText')}</span>
          <div className={s.upgradeForm}>
            <CallbackForm source="COURSE_PAGE" courseId={tree.courseId} plan={plan === 'BASIC' ? 'PRO' : 'DELUXE'} tone="onLime" />
          </div>
        </Reveal>
      )}
    </PanelGrid>
  )
}
