import Link from 'next/link'
import { Reveal } from '@/design/components/Reveal'
import { localized } from '@/lib/localized'
import s from './news.module.css'

type Item = {
  id: string
  slug: string
  title: unknown
  lead: unknown
  coverUrl: string | null
  publishedAt: Date | null
  instagramId: string | null
}

// Cards without a photo get a pastel tear-off calendar page with the date, so
// the grid still looks like a pinboard and not a list of gaps.
const FACES = ['b1', 'a2', 'b2', 'a1', 'c1'] as const

export function newsDate(date: Date | null, locale: string) {
  if (!date) return ''
  return date.toLocaleDateString(tagOf(locale), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tashkent' })
}

const tagOf = (locale: string) => (locale === 'en' ? 'en-GB' : locale === 'uz' ? 'uz-UZ' : 'ru-RU')
const dayOf = (d: Date | null) => (d ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', timeZone: 'Asia/Tashkent' }).format(d) : '')
const monthOf = (d: Date | null, locale: string) =>
  d ? new Intl.DateTimeFormat(tagOf(locale), { day: 'numeric', month: 'long', timeZone: 'Asia/Tashkent' }).format(d).replace(/^\d+\s*/, '') : ''

export function NewsCard({
  item,
  locale,
  feature,
  index = 0,
  labels
}: {
  item: Item
  locale: string
  feature?: boolean
  index?: number
  labels: { fromInstagram: string; readMore: string }
}) {
  const title = localized(item.title, locale)
  const lead = localized(item.lead, locale)
  const face = FACES[index % FACES.length]

  return (
    <Reveal delay={feature ? 0 : (index % 3) * 70} className={feature ? s.feature : s.cardWrap}>
      <Link href={`/${locale}/news/${item.slug}`} className={feature ? s.featureLink : s.card}>
        <span className={s.media} style={item.coverUrl ? undefined : { background: `var(--lv-${face}-bg)`, color: `var(--lv-${face}-fg)` }}>
          {item.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.coverUrl} alt="" loading={feature ? 'eager' : 'lazy'} className={s.cover} />
          ) : (
            <span className={s.face} aria-hidden="true">
              <span className={s.faceDay}>{dayOf(item.publishedAt)}</span>
              <span className={s.faceMonth}>{monthOf(item.publishedAt, locale)}</span>
            </span>
          )}
        </span>
        <span className={s.text}>
          <span className={s.meta}>
            <time dateTime={item.publishedAt?.toISOString()}>{newsDate(item.publishedAt, locale)}</time>
            {item.instagramId && <span className={s.igChip}>{labels.fromInstagram}</span>}
          </span>
          <span className={s.title}>{title}</span>
          {lead && <span className={s.cardLead}>{lead}</span>}
          {feature && <span className={s.read}>{labels.readMore} →</span>}
        </span>
      </Link>
    </Reveal>
  )
}
