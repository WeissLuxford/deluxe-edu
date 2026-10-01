import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Bar } from '@/design/components/Bits'
import { levelCode, levelVars } from '@/design/levels'
import { topicOf } from '@/features/courses/catalog'
import type { CourseTree } from './progress'
import s from './program.module.css'

/** Course banner + Program / About tabs, shared by both course pages. */
export async function CourseHead({ tree, locale, tab }: { tree: CourseTree; locale: string; tab: 'program' | 'about' }) {
  const [t, tu] = await Promise.all([getTranslations({ locale, namespace: 'programPage' }), getTranslations({ locale, namespace: 'ui' })])
  const code = levelCode(tree.level)
  const lv = levelVars(code)
  const topic = topicOf(tree.slug)
  const base = `/${locale}/learn/${tree.slug}`

  return (
    <>
      <div className={s.banner} style={{ background: lv.bg, color: lv.fg }}>
        <span className={s.bannerLevel} aria-hidden="true">{code}</span>
        <span className={s.bannerMeta}>
          {topic !== 'general' ? `${tu(`topics.${topic}`)} · ` : ''}
          {t('plan', { plan: tu(`plans.${tree.plan === 'FREE' ? 'BASIC' : tree.plan}.name`) })}
        </span>
        <div className={s.bannerBody}>
          <h1 className={s.bannerTitle}>{tree.title}</h1>
          <span className={s.bannerProgress}>
            <Bar percent={tree.percent} height={10} color="var(--c-violet)" track="rgba(255,255,255,0.7)" />
            <span>{t('progress', { done: tree.done, total: tree.total })}</span>
          </span>
        </div>
      </div>
      <nav className={s.tabs}>
        <Link href={base} className={[s.tab, tab === 'program' && s.tabOn].filter(Boolean).join(' ')} aria-current={tab === 'program' ? 'page' : undefined}>
          {t('tabProgram')}
        </Link>
        <Link href={`${base}/about`} className={[s.tab, tab === 'about' && s.tabOn].filter(Boolean).join(' ')} aria-current={tab === 'about' ? 'page' : undefined}>
          {t('tabAbout')}
        </Link>
      </nav>
    </>
  )
}
