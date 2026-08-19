import { courseIdBySlug, prisma } from './shared'

type LeadSeed = {
  firstName: string
  lastName: string
  phone: string
  email?: string
  message: string
  source: 'HOME_FORM' | 'COURSE_PAGE' | 'CONTACTS_PAGE' | 'TRIAL_LESSON' | 'LEVEL_TEST'
  courseSlug?: string
  plan?: 'BASIC' | 'PRO' | 'DELUXE'
  locale: string
  status: 'NEW' | 'CONTACTED' | 'RESOLVED'
  hoursAgo: number
}

// Демонстрационные заявки для экрана «Контакты» в админке. Номера заведомо
// нерабочие (998 90 000-00-xx), а в сообщении стоит пометка — чтобы никто не
// начал обзванивать выдуманных людей.
const MARK = '[демо-заявка]'

const LEADS: LeadSeed[] = [
  {
    firstName: 'Дилноза',
    lastName: 'Рахимова',
    phone: '998900000011',
    email: 'demo.dilnoza@example.com',
    message: `${MARK} Хочу в группу Pre-Intermediate с сентября, удобно вечером после 18:00`,
    source: 'COURSE_PAGE',
    courseSlug: 'pre-intermediate-grammar',
    plan: 'PRO',
    locale: 'ru',
    status: 'NEW',
    hoursAgo: 3
  },
  {
    firstName: 'Sardor',
    lastName: 'Yusupov',
    phone: '998900000012',
    message: `${MARK} Daraja testidan o’tdim, natija Intermediate. Qaysi kursni tanlashni bilmayapman`,
    source: 'LEVEL_TEST',
    locale: 'uz',
    status: 'CONTACTED',
    hoursAgo: 27
  },
  {
    firstName: 'Камила',
    lastName: 'Ниязова',
    phone: '998900000013',
    email: 'demo.kamila@example.com',
    message: `${MARK} Прошла пробный урок, понравилось. Нужен IELTS к марту, цель 7.0`,
    source: 'TRIAL_LESSON',
    courseSlug: 'upper-intermediate-ielts-prep',
    plan: 'DELUXE',
    locale: 'ru',
    status: 'NEW',
    hoursAgo: 50
  },
  {
    firstName: 'Timur',
    lastName: 'Aliev',
    phone: '998900000014',
    message: `${MARK} Спрашивал про корпоративное обучение для команды из шести человек`,
    source: 'CONTACTS_PAGE',
    locale: 'ru',
    status: 'RESOLVED',
    hoursAgo: 96
  }
]

export async function seedLeads() {
  for (const lead of LEADS) {
    const courseId = lead.courseSlug ? await courseIdBySlug(lead.courseSlug) : null
    const createdAt = new Date(Date.now() - lead.hoursAgo * 60 * 60 * 1000)

    const existing = await prisma.contactRequest.findFirst({ where: { phone: lead.phone } })
    const data = {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email ?? null,
      message: lead.message,
      source: lead.source,
      courseId,
      plan: lead.plan ?? null,
      locale: lead.locale,
      status: lead.status,
      createdAt
    }

    if (existing) {
      await prisma.contactRequest.update({ where: { id: existing.id }, data })
    } else {
      await prisma.contactRequest.create({ data: { phone: lead.phone, ...data } })
    }
  }

  console.log(`заявки: ${LEADS.length} демо-записи`)
}
