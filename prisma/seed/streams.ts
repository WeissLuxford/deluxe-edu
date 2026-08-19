import { l, prisma, type L10n } from './shared'

type StreamSeed = {
  key: string
  title: L10n
  description: L10n
  kind: 'YOUTUBE' | 'ZOOM'
  daysFromNow: number
  hour: number
  durationMin: number
  requiredPlan?: 'PRO' | 'DELUXE'
  recorded?: boolean
}

// Стримы без ссылок: ссылку на трансляцию клиент подставит в админке в день
// эфира. Пустое поле честнее выдуманного идентификатора, который никуда не
// ведёт.
const STREAMS: StreamSeed[] = [
  {
    key: 'speaking-club-live',
    title: l(
      'Разговорный клуб в эфире: как рассказать о себе за минуту',
      'Suhbat klubi efirda: bir daqiqada o’zingiz haqingizda gapirish',
      'Speaking club live: introducing yourself in a minute'
    ),
    description: l(
      'Открытый эфир для всех уровней от Elementary. Разбираем структуру самопрезентации и тренируем её вслух.',
      'Elementary’dan boshlab barcha darajalar uchun ochiq efir. O’z-o’zini tanishtirish tuzilishini tahlil qilamiz va ovoz chiqarib mashq qilamiz.',
      'An open session for Elementary and above. We break down how a self-introduction is built and practise it aloud.'
    ),
    kind: 'YOUTUBE',
    daysFromNow: 4,
    hour: 19,
    durationMin: 60
  },
  {
    key: 'ielts-writing-workshop',
    title: l(
      'IELTS Writing Task 2: разбор работ студентов',
      'IELTS Writing Task 2: talabalar ishlarining tahlili',
      'IELTS Writing Task 2: student essays reviewed'
    ),
    description: l(
      'Преподаватель разбирает присланные эссе по критериям экзамена и показывает, где теряются полбалла.',
      'O’qituvchi yuborilgan esselarni imtihon mezonlari bo’yicha tahlil qiladi va yarim ball qayerda yo’qolishini ko’rsatadi.',
      'A teacher marks submitted essays against the exam criteria and shows exactly where half a band goes missing.'
    ),
    kind: 'ZOOM',
    daysFromNow: 9,
    hour: 18,
    durationMin: 90,
    requiredPlan: 'PRO'
  },
  {
    key: 'grammar-qa',
    title: l(
      'Вопросы по грамматике: перфект и условные',
      'Grammatika savollari: perfect va shartli gaplar',
      'Grammar Q&A: perfect tenses and conditionals'
    ),
    description: l(
      'Запись эфира: отвечаем на вопросы, которые студенты присылали всю неделю.',
      'Efir yozuvi: talabalar hafta davomida yuborgan savollarga javob beramiz.',
      'Recorded session: answers to the questions students sent in over the week.'
    ),
    kind: 'YOUTUBE',
    daysFromNow: -6,
    hour: 19,
    durationMin: 75,
    recorded: true
  }
]

export async function seedStreams() {
  for (const stream of STREAMS) {
    const startsAt = new Date()
    startsAt.setDate(startsAt.getDate() + stream.daysFromNow)
    startsAt.setHours(stream.hour, 0, 0, 0)

    const data = {
      title: stream.title,
      description: stream.description,
      kind: stream.kind,
      startsAt,
      durationMin: stream.durationMin,
      requiredPlan: stream.requiredPlan ?? null,
      published: true
    }

    const existing = await prisma.stream.findFirst({
      where: { startsAt, durationMin: stream.durationMin }
    })

    if (existing) {
      await prisma.stream.update({ where: { id: existing.id }, data })
    } else {
      await prisma.stream.create({ data })
    }
  }

  console.log(`стримы: ${STREAMS.length}`)
}
