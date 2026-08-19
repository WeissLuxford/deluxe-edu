import { l, prisma, type L10n } from './shared'

type CourseSeed = {
  slug: string
  title: L10n
  description: L10n
  level: string
  priceBasic: number
  pricePro: number
  priceDeluxe: number
  badge?: string
}

// Каталог-витрина. Цены и тексты клиент правит в админке, здесь они нужны,
// чтобы страница курсов не выглядела пустой на демонстрации.
const FREE: CourseSeed[] = [
  {
    slug: 'trial-lesson',
    title: l('Бесплатный пробный урок', 'Bepul sinov darsi', 'Free trial lesson'),
    description: l(
      'Полный урок целиком: видео, конспект и тест. Ровно так устроены уроки в платных курсах',
      'To’liq dars: video, konspekt va test. Pullik kurslardagi darslar aynan shunday tuzilgan',
      'A complete lesson: video, notes and a test. Paid courses are built exactly the same way'
    ),
    level: 'Other',
    priceBasic: 0,
    pricePro: 0,
    priceDeluxe: 0
  },
  {
    slug: 'level-test',
    title: l('Тест на определение уровня', 'Daraja aniqlash testi', 'English level test'),
    description: l(
      'Двадцать четыре вопроса по грамматике, лексике и чтению. В конце — уровень по шкале CEFR и совет, с каких курсов начать',
      'Grammatika, lug’at va o’qish bo’yicha yigirma to’rtta savol. Yakunda — CEFR shkalasi bo’yicha daraja va qaysi kursdan boshlash bo’yicha maslahat',
      'Twenty-four questions on grammar, vocabulary and reading. At the end — your CEFR level and where to start'
    ),
    level: 'Other',
    priceBasic: 0,
    pricePro: 0,
    priceDeluxe: 0
  },
  {
    slug: 'free-mock-test-online',
    title: l('Бесплатный mock test', 'Bepul mock test', 'Free mock test'),
    description: l(
      'Три раздела в формате IELTS с автоматической проверкой: чтение, грамматика и лексика',
      'IELTS formatidagi uchta bo’lim, avtomatik tekshiruv bilan: o’qish, grammatika va lug’at',
      'Three IELTS-format sections with instant marking: reading, grammar and vocabulary'
    ),
    level: 'Other',
    priceBasic: 0,
    pricePro: 0,
    priceDeluxe: 0
  }
]

const CATALOGUE: CourseSeed[] = [
  {
    slug: 'beginner-grammar',
    title: l('Основы грамматики', 'Grammatika asoslari', 'Grammar fundamentals'),
    description: l(
      'Present Simple, артикли, местоимения и порядок слов — база, без которой не собирается ни одно предложение',
      'Present Simple, artikllar, olmoshlar va so’z tartibi — hech bir gap ularsiz tuzilmaydi',
      'Present Simple, articles, pronouns and word order — the base every sentence rests on'
    ),
    level: 'Beginner',
    priceBasic: 200000,
    pricePro: 400000,
    priceDeluxe: 800000,
    badge: 'HIT'
  },
  {
    slug: 'beginner-speaking',
    title: l('Разговорная практика с нуля', 'Noldan suhbat amaliyoti', 'Speaking from scratch'),
    description: l(
      'Представиться, спросить дорогу, заказать кофе — короткие диалоги, которые нужны в первый же день',
      'Tanishtirish, yo’l so’rash, kofe buyurtma qilish — birinchi kundanoq kerak bo’ladigan qisqa dialoglar',
      'Introduce yourself, ask for directions, order coffee — the short dialogues you need on day one'
    ),
    level: 'Beginner',
    priceBasic: 220000,
    pricePro: 420000,
    priceDeluxe: 820000
  },
  {
    slug: 'beginner-vocabulary',
    title: l('Базовая лексика', 'Asosiy lug’at', 'Essential vocabulary'),
    description: l(
      'Тысяча самых частых слов и способ их запоминать так, чтобы они всплывали в речи, а не в тетради',
      'Eng ko’p ishlatiladigan ming so’z va ularni daftarda emas, nutqda paydo bo’ladigan qilib yodlash usuli',
      'The thousand most frequent words, and a way to remember them that shows up in speech, not in a notebook'
    ),
    level: 'Beginner',
    priceBasic: 180000,
    pricePro: 380000,
    priceDeluxe: 780000
  },
  {
    slug: 'elementary-grammar',
    title: l('Грамматика Elementary', 'Elementary grammatika', 'Elementary grammar'),
    description: l(
      'Прошедшее время, планы на будущее и сравнения — язык перестаёт быть только про «здесь и сейчас»',
      'O’tgan zamon, kelajak rejalari va qiyoslash — til faqat «shu yer va hozir» haqida bo’lmay qoladi',
      'Past tense, future plans and comparisons — the language stops being only about here and now'
    ),
    level: 'Elementary',
    priceBasic: 250000,
    pricePro: 450000,
    priceDeluxe: 850000
  },
  {
    slug: 'elementary-speaking',
    title: l('Уверенная речь Elementary', 'Elementary ishonchli nutq', 'Elementary speaking confidence'),
    description: l(
      'Рассказать о себе, о работе и о прошедших выходных так, чтобы собеседник не переспрашивал',
      'O’zingiz, ishingiz va o’tgan dam olish kunlaringiz haqida suhbatdosh qayta so’ramaydigan qilib gapirish',
      'Talk about yourself, your job and last weekend without your listener asking you to repeat'
    ),
    level: 'Elementary',
    priceBasic: 270000,
    pricePro: 470000,
    priceDeluxe: 870000
  },
  {
    slug: 'pre-intermediate-grammar',
    title: l('Грамматика Pre-Intermediate', 'Pre-Intermediate grammatika', 'Pre-Intermediate grammar'),
    description: l(
      'Перфектные времена, условные предложения и пассив — то место, где обычно застревают надолго',
      'Perfect zamonlar, shartli gaplar va passiv nisbat — odatda uzoq vaqt qotib qoladigan joy',
      'Perfect tenses, conditionals and the passive — the place where most learners get stuck'
    ),
    level: 'Pre-Intermediate',
    priceBasic: 300000,
    pricePro: 500000,
    priceDeluxe: 900000,
    badge: 'NEW'
  },
  {
    slug: 'pre-intermediate-speaking',
    title: l('Разговорные навыки Pre-Intermediate', 'Pre-Intermediate nutq ko’nikmalari', 'Pre-Intermediate speaking'),
    description: l(
      'Держать разговор дольше пары реплик: аргумент, пример, вывод',
      'Suhbatni bir-ikki gapdan uzoqroq davom ettirish: dalil, misol, xulosa',
      'Keep a conversation going past two lines: point, example, conclusion'
    ),
    level: 'Pre-Intermediate',
    priceBasic: 320000,
    pricePro: 520000,
    priceDeluxe: 920000
  },
  {
    slug: 'pre-intermediate-mock-test',
    title: l('Подготовка к mock test', 'Mock testga tayyorgarlik', 'Mock test preparation'),
    description: l(
      'Полные пробные тесты и стратегия: как распределить время и не терять баллы на формате',
      'To’liq sinov testlari va strategiya: vaqtni qanday taqsimlash va format ustida ball yo’qotmaslik',
      'Full practice tests plus strategy: how to budget time and stop losing marks to the format'
    ),
    level: 'Pre-Intermediate',
    priceBasic: 280000,
    pricePro: 480000,
    priceDeluxe: 880000
  },
  {
    slug: 'intermediate-grammar',
    title: l('Грамматика Intermediate', 'Intermediate grammatika', 'Intermediate grammar'),
    description: l(
      'Косвенная речь, модальные глаголы и сложные условные — грамматика для точных формулировок',
      'Bilvosita nutq, modal fe’llar va murakkab shartli gaplar — aniq ifodalar uchun grammatika',
      'Reported speech, modal verbs and complex conditionals — grammar for saying exactly what you mean'
    ),
    level: 'Intermediate',
    priceBasic: 350000,
    pricePro: 550000,
    priceDeluxe: 950000
  },
  {
    slug: 'intermediate-speaking',
    title: l('Беглая речь Intermediate', 'Intermediate ravon nutq', 'Intermediate fluency'),
    description: l(
      'Дискуссии и споры: как возражать, соглашаться наполовину и возвращать разговор к теме',
      'Munozara va bahs: qanday e’tiroz bildirish, yarim rozi bo’lish va suhbatni mavzuga qaytarish',
      'Discussion and debate: how to disagree, half-agree, and steer the talk back on topic'
    ),
    level: 'Intermediate',
    priceBasic: 370000,
    pricePro: 570000,
    priceDeluxe: 970000
  },
  {
    slug: 'intermediate-business-english',
    title: l('Деловой английский', 'Ishbilarmonlik ingliz tili', 'Business English'),
    description: l(
      'Письма, созвоны и презентации: формулировки, по которым вас считают своим на рабочей встрече',
      'Xatlar, qo’ng’iroqlar va taqdimotlar: ish uchrashuvida o’z odam deb qabul qilinadigan ifodalar',
      'Emails, calls and presentations: the phrasing that makes you sound at home in a work meeting'
    ),
    level: 'Intermediate',
    priceBasic: 400000,
    pricePro: 600000,
    priceDeluxe: 1000000,
    badge: 'HIT'
  },
  {
    slug: 'intermediate-mock-test',
    title: l('Mock test курс', 'Mock test kursi', 'Mock test course'),
    description: l(
      'Серия пробных тестов с разбором каждой ошибки и понятной динамикой по неделям',
      'Har bir xatoni tahlil qiladigan sinov testlari seriyasi va haftalar bo’yicha aniq dinamika',
      'A series of practice tests with every mistake explained and week-by-week progress you can see'
    ),
    level: 'Intermediate',
    priceBasic: 330000,
    pricePro: 530000,
    priceDeluxe: 930000
  },
  {
    slug: 'upper-intermediate-grammar',
    title: l('Грамматика Upper-Intermediate', 'Upper-Intermediate grammatika', 'Upper-Intermediate grammar'),
    description: l(
      'Оттенки смысла: инверсия, эмфаза и формальные конструкции академического английского',
      'Ma’no nozikliklari: inversiya, urg’u va akademik ingliz tilining rasmiy tuzilmalari',
      'Shades of meaning: inversion, emphasis and the formal patterns of academic English'
    ),
    level: 'Upper-Intermediate',
    priceBasic: 400000,
    pricePro: 600000,
    priceDeluxe: 1000000
  },
  {
    slug: 'upper-intermediate-speaking',
    title: l('Продвинутая речь', 'Ilg’or nutq', 'Advanced speaking'),
    description: l(
      'Сложные мысли простыми словами: интонация, паузы и структура развёрнутого ответа',
      'Murakkab fikrlar oddiy so’zlar bilan: ohang, pauza va kengaytirilgan javob tuzilishi',
      'Complex ideas in plain words: intonation, pauses and the shape of a long answer'
    ),
    level: 'Upper-Intermediate',
    priceBasic: 420000,
    pricePro: 620000,
    priceDeluxe: 1020000
  },
  {
    slug: 'upper-intermediate-ielts-prep',
    title: l('Подготовка к IELTS', 'IELTS tayyorgarligi', 'IELTS preparation'),
    description: l(
      'Все четыре части экзамена, критерии оценивания и работа над теми, что тянут балл вниз',
      'Imtihonning to’rt qismi, baholash mezonlari va ballni pasaytiradigan joylar ustida ish',
      'All four parts of the exam, the marking criteria, and work on whatever drags your band down'
    ),
    level: 'Upper-Intermediate',
    priceBasic: 450000,
    pricePro: 650000,
    priceDeluxe: 1050000,
    badge: 'IELTS'
  },
  {
    slug: 'upper-intermediate-mock-test',
    title: l('Серия mock test', 'Mock test seriyasi', 'Mock test series'),
    description: l(
      'Экзамен по расписанию и в тишине: репетиция настоящего дня сдачи',
      'Jadval bo’yicha va sukunatda imtihon: haqiqiy topshirish kunining mashqi',
      'A timed, silent exam: a rehearsal of the real test day'
    ),
    level: 'Upper-Intermediate',
    priceBasic: 380000,
    pricePro: 580000,
    priceDeluxe: 980000
  },
  {
    slug: 'advanced-speaking-mastery',
    title: l('Мастерство речи', 'Nutq mahorati', 'Speaking mastery'),
    description: l(
      'Произношение, ритм и уместность: один и тот же смысл — для друга, для клиента и для сцены',
      'Talaffuz, ritm va o’rinlilik: bir xil ma’no — do’stga, mijozga va sahnaga',
      'Pronunciation, rhythm and register: the same meaning for a friend, a client and a stage'
    ),
    level: 'Advanced',
    priceBasic: 500000,
    pricePro: 700000,
    priceDeluxe: 1100000
  },
  {
    slug: 'advanced-academic-writing',
    title: l('Академическое письмо', 'Akademik yozuv', 'Academic writing'),
    description: l(
      'Эссе и научные тексты: тезис, аргумент, источник и всё то, за что снимают баллы',
      'Esse va ilmiy matnlar: tezis, dalil, manba va ball olib tashlanadigan barcha narsa',
      'Essays and research writing: thesis, argument, sources — and everything that costs you marks'
    ),
    level: 'Advanced',
    priceBasic: 480000,
    pricePro: 680000,
    priceDeluxe: 1080000
  },
  {
    slug: 'advanced-professional-english',
    title: l('Профессиональный английский', 'Professional ingliz tili', 'Professional English'),
    description: l(
      'Переговоры и управленческая коммуникация: как звучать спокойно, когда ставка высока',
      'Muzokaralar va boshqaruv muloqoti: garov yuqori bo’lganda xotirjam ovozda gapirish',
      'Negotiation and executive communication: how to sound calm when the stakes are high'
    ),
    level: 'Advanced',
    priceBasic: 550000,
    pricePro: 750000,
    priceDeluxe: 1150000
  },
  {
    slug: 'advanced-mock-test-intensive',
    title: l('Интенсив mock test', 'Mock test intensivi', 'Mock test intensive'),
    description: l(
      'Для тех, кому нужен 7.5+: разбор каждой потерянной половины балла',
      '7.5+ kerak bo’lganlar uchun: yo’qotilgan har yarim ballning tahlili',
      'For anyone chasing 7.5+: every lost half-band accounted for'
    ),
    level: 'Advanced',
    priceBasic: 450000,
    pricePro: 650000,
    priceDeluxe: 1050000
  }
]

export async function seedCourses() {
  for (const course of [...FREE, ...CATALOGUE]) {
    const data = {
      title: course.title,
      description: course.description,
      level: course.level,
      priceBasic: course.priceBasic,
      pricePro: course.pricePro,
      priceDeluxe: course.priceDeluxe,
      badge: course.badge ?? null,
      published: true,
      visible: true
    }

    await prisma.course.upsert({
      where: { slug: course.slug },
      update: data,
      create: { slug: course.slug, ...data }
    })
  }

  console.log(`курсы: ${FREE.length + CATALOGUE.length}`)
}
