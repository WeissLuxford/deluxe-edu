import type { Teacher } from '@/features/teachers/registry'
import { pickText } from '@/features/teachers/registry'

// Разметка schema.org в одном месте. До этого JSON-LD жил только на главной, и
// каждая новая страница рисовала бы свой объект руками — отсюда расхождения в
// названии организации и в адресе сайта.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const ORG_NAME = 'Highgate'

export function organizationJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: ORG_NAME,
    url: `${SITE_URL}/${locale}`,
    areaServed: 'UZ'
  }
}

export function personJsonLd(teacher: Teacher, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: teacher.name,
    jobTitle: pickText(teacher.role, locale),
    description: pickText(teacher.bio, locale),
    url: `${SITE_URL}/${locale}/teachers/${teacher.slug}`,
    ...(teacher.photo ? { image: `${SITE_URL}${teacher.photo}` } : {}),
    // Пустой список лучше, чем выдуманный: hasCredential проверяют глазами.
    ...(teacher.credentials.length
      ? {
          hasCredential: teacher.credentials.map(name => ({
            '@type': 'EducationalOccupationalCredential',
            name
          }))
        }
      : {}),
    worksFor: { '@type': 'EducationalOrganization', name: ORG_NAME }
  }
}

export function courseJsonLd(input: {
  title: string
  description: string
  slug: string
  locale: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.title,
    description: input.description,
    url: `${SITE_URL}/${input.locale}/courses/${input.slug}`,
    provider: { '@type': 'EducationalOrganization', name: ORG_NAME, url: SITE_URL }
  }
}

/**
 * Блок вопросов и ответов. Конкурент занимает этой разметкой запрос «лучший
 * центр английского в Узбекистане»; спорить за него бессмысленно, но сама
 * разметка нужна — по длинному хвосту она работает так же.
 */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  }
}
