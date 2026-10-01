import { getTranslations } from 'next-intl/server'
import s from './home.module.css'

// The hero illustration is the product itself: a lesson card, a streak, a
// teacher's note and a right answer — each floats in with a small delay.
export async function HeroCollage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'homePage.collage' })

  return (
    <div className={s.collage} aria-hidden="true">
      <div className={`${s.float} ${s.lessonCard}`} style={{ ['--d' as string]: '80ms' }}>
        <div className={s.player}>
          <span className={s.play}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className={s.playerBar}><span /></span>
        </div>
        <div className={s.lessonRow}>
          <span className={s.lessonText}>
            <span className={s.lessonMeta}>{t('lessonMeta')}</span>
            <span className={s.lessonTitle}>{t('lessonTitle')}</span>
          </span>
          <span className={s.levelChip}>B1</span>
        </div>
      </div>

      <div className={`${s.float} ${s.streak}`} style={{ ['--d' as string]: '220ms' }}>
        <span className={s.streakNum}>7</span>
        <span className={s.streakText}>
          {t('streakDays')}
          <br />
          {t('streakCheer')}
        </span>
      </div>

      <div className={`${s.float} ${s.note}`} style={{ ['--d' as string]: '360ms' }}>
        <span className={s.noteFrom}>{t('noteFrom')}</span>
        <span className={s.noteText}>{t('note')}</span>
      </div>

      <div className={`${s.float} ${s.quiz}`} style={{ ['--d' as string]: '480ms' }}>
        <span className={s.quizCheck}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <span className={s.quizText}>
          {t('quizRight')} <span>{t('quizText')}</span>
        </span>
      </div>
    </div>
  )
}
