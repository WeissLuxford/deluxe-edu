import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/design/components/Button'
import { Chip } from '@/design/components/Bits'
import { Reveal } from '@/design/components/Reveal'
import { LEVEL_CODES, levelVars } from '@/design/levels'
import { pickText, type Teacher } from './registry'
import s from '@/features/site/info.module.css'

export function Portrait({ teacher, className, bg, priority }: { teacher: Teacher; className: string; bg: string; priority?: boolean }) {
  return (
    <span className={className} style={{ background: bg }}>
      {teacher.photo ? (
        <Image src={teacher.photo} alt={teacher.name} width={420} height={460} className={s.portraitImg} priority={priority} />
      ) : (
        <span className={s.portraitInitial} aria-hidden="true">
          {teacher.name.slice(0, 1)}
        </span>
      )}
    </span>
  )
}

export const firstName = (teacher: Teacher) => teacher.name.split(' ')[0]

/**
 * The big teacher block from the canvas: portrait, credentials, name, their own
 * words, and the way to start. On the list the name leads to the profile; on the
 * profile it is the page heading.
 */
export function FeaturedTeacher({
  teacher,
  locale,
  labels,
  asHeading,
  profileHref
}: {
  teacher: Teacher
  locale: string
  labels: { studyWith: string; video?: string }
  asHeading?: boolean
  profileHref?: string
}) {
  const NameTag = asHeading ? 'h1' : 'span'
  return (
    <Reveal className={s.featured}>
      <Portrait teacher={teacher} className={s.portrait} bg="var(--lv-b2-bg)" priority={asHeading} />
      <div className={s.featuredBody}>
        {teacher.credentials.length > 0 && (
          <span className={s.chips}>
            {teacher.credentials.map(c => (
              <Chip key={c}>{c}</Chip>
            ))}
          </span>
        )}
        <NameTag className={s.featuredName}>
          {profileHref ? (
            <Link href={profileHref} className={s.nameLink}>
              {teacher.name}
            </Link>
          ) : (
            teacher.name
          )}
        </NameTag>
        <span className={s.teacherCardRole}>{pickText(teacher.role, locale)}</span>
        <p className={s.quote}>
          <span className="it">«</span>
          {pickText(teacher.bio, locale)}
          <span className="it">»</span>
        </p>
        <span className={s.featuredActions}>
          <Button href={`/${locale}/trial-lesson`} size="lg" arrow>
            {labels.studyWith}
          </Button>
          {teacher.videoUrl && labels.video && (
            <a href={teacher.videoUrl} target="_blank" rel="noreferrer" className={s.videoLink}>
              ▶ {labels.video}
            </a>
          )}
        </span>
      </div>
    </Reveal>
  )
}

export function TeacherCards({ teachers, locale }: { teachers: Teacher[]; locale: string }) {
  return (
    <div className={s.teacherGrid}>
      {teachers.map((teacher, i) => (
        <Reveal key={teacher.slug} delay={i * 80}>
          <Link href={`/${locale}/teachers/${teacher.slug}`} className={s.teacherCard}>
            <Portrait teacher={teacher} className={s.teacherCardPhoto} bg={levelVars(LEVEL_CODES[i % LEVEL_CODES.length]).bg} />
            <span className={s.teacherCardBody}>
              <span className={s.teacherCardName}>{teacher.name}</span>
              <span className={s.teacherCardRole}>{pickText(teacher.role, locale)}</span>
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}
