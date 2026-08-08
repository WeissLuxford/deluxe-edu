// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding courses...')

  const courses = [
    // FREE TRIAL LESSON (бесплатный пробный урок)
    {
      slug: 'trial-lesson',
      title: {
        en: 'Free Trial Lesson',
        ru: 'Бесплатный пробный урок',
        uz: 'Bepul sinov darsi'
      },
      description: {
        en: 'Experience our teaching style with a complete lesson for free',
        ru: 'Попробуйте наш стиль обучения с полным уроком бесплатно',
        uz: 'Bizning o\'qitish uslubimizni bepul to\'liq dars bilan sinab ko\'ring'
      },
      level: 'Other',
      priceBasic: 0,
      pricePro: 0,
      priceDeluxe: 0,
      published: true,
      visible: true
    },

    // LEVEL TEST (бесплатный)
    {
      slug: 'level-test',
      title: {
        en: 'English Level Test',
        ru: 'Тест на определение уровня',
        uz: 'Ingliz tili darajasini aniqlash testi'
      },
      description: {
        en: 'Not sure about your level? Take our free 15-minute test to find out',
        ru: 'Не знаете свой уровень? Пройдите бесплатный 15-минутный тест',
        uz: "Darajangizni bilmaysizmi? Bepul 15 daqiqalik testdan o'ting"
      },
      level: 'Other',
      priceBasic: 0,
      pricePro: 0,
      priceDeluxe: 0,
      published: true,
      visible: true
    },

    // FREE MOCK TEST (бесплатный онлайн без учителя)
    {
      slug: 'free-mock-test-online',
      title: {
        en: 'Free Mock Test Online',
        ru: 'Бесплатный Mock Test онлайн',
        uz: 'Bepul onlayn Mock Test'
      },
      description: {
        en: 'Practice with real IELTS/TOEFL format. Auto-graded with instant results.',
        ru: 'Практикуйтесь с реальными форматами IELTS/TOEFL. Автопроверка.',
        uz: 'IELTS/TOEFL formati. Avtomatik tekshirish.'
      },
      level: 'Other',
      priceBasic: 0,
      pricePro: 0,
      priceDeluxe: 0,
      published: true,
      visible: true
    },

    // BEGINNER
    {
      slug: 'beginner-grammar',
      title: {
        en: 'Beginner Grammar Fundamentals',
        ru: 'Основы грамматики для начинающих',
        uz: 'Boshlang\'ich grammatika asoslari'
      },
      description: {
        en: 'Master the basics: present simple, pronouns, articles, and essential grammar rules',
        ru: 'Освойте основы: Present Simple, местоимения, артикли и базовые правила',
        uz: 'Asoslarni o\'rganing: Present Simple, olmoshlar va asosiy qoidalar'
      },
      level: 'Beginner',
      priceBasic: 200000,
      pricePro: 400000,
      priceDeluxe: 800000,
      published: true,
      visible: true
    },
    {
      slug: 'beginner-speaking',
      title: {
        en: 'Beginner Speaking Practice',
        ru: 'Разговорная практика для начинающих',
        uz: 'Boshlang\'ich suhbat amaliyoti'
      },
      description: {
        en: 'Learn to introduce yourself, ask questions, and have basic conversations in English',
        ru: 'Научитесь представляться, задавать вопросы и вести простые беседы на английском',
        uz: 'O\'zingizni tanishtiring, savol bering va oddiy suhbatlar qiling'
      },
      level: 'Beginner',
      priceBasic: 220000,
      pricePro: 420000,
      priceDeluxe: 820000,
      published: true,
      visible: true
    },
    {
      slug: 'beginner-vocabulary',
      title: {
        en: 'Essential Vocabulary for Beginners',
        ru: 'Базовая лексика для начинающих',
        uz: 'Boshlang\'ichlar uchun muhim lug\'at'
      },
      description: {
        en: 'Build your vocabulary: 1000+ most common words for everyday communication',
        ru: 'Расширьте словарный запас: 1000+ самых частых слов для повседневного общения',
        uz: '1000+ eng keng tarqalgan so\'zlarni o\'rganing'
      },
      level: 'Beginner',
      priceBasic: 180000,
      pricePro: 380000,
      priceDeluxe: 780000,
      published: true,
      visible: true
    },

    // ELEMENTARY
    {
      slug: 'elementary-grammar',
      title: {
        en: 'Elementary Grammar',
        ru: 'Грамматика Elementary',
        uz: 'Elementary grammatika'
      },
      description: {
        en: 'Past simple, future forms, comparatives, and more complex grammar structures',
        ru: 'Past Simple, будущее время, сравнительная степень и сложные конструкции',
        uz: 'Past Simple, kelajak zamon va murakkab grammatik tuzilmalar'
      },
      level: 'Elementary',
      priceBasic: 250000,
      pricePro: 450000,
      priceDeluxe: 850000,
      published: true,
      visible: true
    },
    {
      slug: 'elementary-speaking',
      title: {
        en: 'Elementary Speaking Confidence',
        ru: 'Уверенная речь Elementary',
        uz: 'Elementary ishonchli nutq'
      },
      description: {
        en: 'Express opinions, describe experiences, and discuss everyday topics confidently',
        ru: 'Выражайте мнения, описывайте опыт и обсуждайте повседневные темы уверенно',
        uz: 'Fikrlaringizni bildiring, tajribangizni tasvirlang'
      },
      level: 'Elementary',
      priceBasic: 270000,
      pricePro: 470000,
      priceDeluxe: 870000,
      published: true,
      visible: true
    },

    // PRE-INTERMEDIATE
    {
      slug: 'pre-intermediate-grammar',
      title: {
        en: 'Pre-Intermediate Grammar',
        ru: 'Грамматика Pre-Intermediate',
        uz: 'Pre-Intermediate grammatika'
      },
      description: {
        en: 'Perfect tenses, conditionals, passive voice, and advanced sentence structures',
        ru: 'Перфектные времена, условные предложения, пассивный залог',
        uz: 'Perfect zamonlar, shartli gaplar, passiv nisbat'
      },
      level: 'Pre-Intermediate',
      priceBasic: 300000,
      pricePro: 500000,
      priceDeluxe: 900000,
      published: true,
      visible: true
    },
    {
      slug: 'pre-intermediate-speaking',
      title: {
        en: 'Pre-Intermediate Speaking Skills',
        ru: 'Разговорные навыки Pre-Intermediate',
        uz: 'Pre-Intermediate nutq ko\'nikmalari'
      },
      description: {
        en: 'Discuss abstract topics, give presentations, and participate in detailed conversations',
        ru: 'Обсуждайте абстрактные темы, делайте презентации, ведите детальные беседы',
        uz: 'Mavzularni muhokama qiling, taqdimotlar qiling'
      },
      level: 'Pre-Intermediate',
      priceBasic: 320000,
      pricePro: 520000,
      priceDeluxe: 920000,
      published: true,
      visible: true
    },
    {
      slug: 'pre-intermediate-mock-test',
      title: {
        en: 'Pre-Intermediate Mock Test Preparation',
        ru: 'Подготовка к Mock Test (Pre-Intermediate)',
        uz: 'Pre-Intermediate Mock Test tayyorlash'
      },
      description: {
        en: 'Practice full-length mock tests and improve your exam-taking strategies',
        ru: 'Тренируйтесь на полноценных пробных тестах, улучшайте стратегию сдачи экзаменов',
        uz: 'To\'liq mock testlarni mashq qiling, strategiyani yaxshilang'
      },
      level: 'Pre-Intermediate',
      priceBasic: 280000,
      pricePro: 480000,
      priceDeluxe: 880000,
      published: true,
      visible: true
    },

    // INTERMEDIATE
    {
      slug: 'intermediate-grammar',
      title: {
        en: 'Intermediate Grammar Mastery',
        ru: 'Мастерство грамматики Intermediate',
        uz: 'Intermediate grammatika mahorati'
      },
      description: {
        en: 'Advanced conditionals, reported speech, modal verbs, and complex grammar patterns',
        ru: 'Сложные условные предложения, косвенная речь, модальные глаголы',
        uz: 'Murakkab shartli gaplar, bilvosita nutq, modal fe\'llar'
      },
      level: 'Intermediate',
      priceBasic: 350000,
      pricePro: 550000,
      priceDeluxe: 950000,
      published: true,
      visible: true
    },
    {
      slug: 'intermediate-speaking',
      title: {
        en: 'Intermediate Speaking Fluency',
        ru: 'Беглая речь Intermediate',
        uz: 'Intermediate ravon nutq'
      },
      description: {
        en: 'Achieve fluency in discussions, debates, and professional communication',
        ru: 'Достигните беглости в дискуссиях, дебатах и деловом общении',
        uz: 'Muhokamalar, munozaralar va professional muloqotda ravonlikka erishing'
      },
      level: 'Intermediate',
      priceBasic: 370000,
      pricePro: 570000,
      priceDeluxe: 970000,
      published: true,
      visible: true
    },
    {
      slug: 'intermediate-business-english',
      title: {
        en: 'Business English for Intermediate',
        ru: 'Деловой английский (Intermediate)',
        uz: 'Intermediate ishbilarmonlik ingliz tili'
      },
      description: {
        en: 'Master business vocabulary, email writing, meetings, and professional presentations',
        ru: 'Освойте деловую лексику, написание писем, ведение встреч и презентаций',
        uz: 'Biznes lug\'ati, email yozish, uchrashuvlar va taqdimotlar'
      },
      level: 'Intermediate',
      priceBasic: 400000,
      pricePro: 600000,
      priceDeluxe: 1000000,
      published: true,
      visible: true
    },
    {
      slug: 'intermediate-mock-test',
      title: {
        en: 'Intermediate Mock Test Course',
        ru: 'Mock Test курс (Intermediate)',
        uz: 'Intermediate Mock Test kursi'
      },
      description: {
        en: 'Comprehensive mock test practice with detailed feedback and scoring',
        ru: 'Комплексная практика mock test с детальным фидбеком и оценками',
        uz: 'Batafsil izoh va baholash bilan mock test mashqlari'
      },
      level: 'Intermediate',
      priceBasic: 330000,
      pricePro: 530000,
      priceDeluxe: 930000,
      published: true,
      visible: true
    },

    // UPPER-INTERMEDIATE
    {
      slug: 'upper-intermediate-grammar',
      title: {
        en: 'Upper-Intermediate Grammar Perfection',
        ru: 'Совершенная грамматика Upper-Intermediate',
        uz: 'Upper-Intermediate mukammal grammatika'
      },
      description: {
        en: 'Master subtle grammar nuances, formal structures, and academic English patterns',
        ru: 'Освойте тонкости грамматики, формальные структуры и академический английский',
        uz: 'Grammatik nozikliklarni, rasmiy tuzilmalarni o\'rganing'
      },
      level: 'Upper-Intermediate',
      priceBasic: 400000,
      pricePro: 600000,
      priceDeluxe: 1000000,
      published: true,
      visible: true
    },
    {
      slug: 'upper-intermediate-speaking',
      title: {
        en: 'Upper-Intermediate Advanced Speaking',
        ru: 'Продвинутая речь Upper-Intermediate',
        uz: 'Upper-Intermediate ilg\'or nutq'
      },
      description: {
        en: 'Express complex ideas, argue persuasively, and communicate like a native speaker',
        ru: 'Выражайте сложные идеи, убедительно аргументируйте, говорите как носитель',
        uz: 'Murakkab fikrlarni ifodalang, ishonchli dalillar keltiring'
      },
      level: 'Upper-Intermediate',
      priceBasic: 420000,
      pricePro: 620000,
      priceDeluxe: 1020000,
      published: true,
      visible: true
    },
    {
      slug: 'upper-intermediate-ielts-prep',
      title: {
        en: 'IELTS Preparation (Upper-Intermediate)',
        ru: 'Подготовка к IELTS (Upper-Intermediate)',
        uz: 'IELTS tayyorgarlik (Upper-Intermediate)'
      },
      description: {
        en: 'Comprehensive IELTS preparation: all sections, strategies, and practice tests',
        ru: 'Полная подготовка к IELTS: все разделы, стратегии и пробные тесты',
        uz: 'To\'liq IELTS tayyorgarlik: barcha bo\'limlar, strategiyalar va testlar'
      },
      level: 'Upper-Intermediate',
      priceBasic: 450000,
      pricePro: 650000,
      priceDeluxe: 1050000,
      published: true,
      visible: true
    },
    {
      slug: 'upper-intermediate-mock-test',
      title: {
        en: 'Upper-Intermediate Mock Test Series',
        ru: 'Серия Mock Test (Upper-Intermediate)',
        uz: 'Upper-Intermediate Mock Test seriyasi'
      },
      description: {
        en: 'Advanced mock test practice with IELTS/TOEFL format and expert analysis',
        ru: 'Продвинутая практика mock test в формате IELTS/TOEFL с анализом экспертов',
        uz: 'IELTS/TOEFL formatida mock test va ekspert tahlili'
      },
      level: 'Upper-Intermediate',
      priceBasic: 380000,
      pricePro: 580000,
      priceDeluxe: 980000,
      published: true,
      visible: true
    },

    // ADVANCED
    {
      slug: 'advanced-speaking-mastery',
      title: {
        en: 'Advanced Speaking Mastery',
        ru: 'Мастерство речи Advanced',
        uz: 'Advanced nutq mahorati'
      },
      description: {
        en: 'Perfect your pronunciation, intonation, and speaking style for any context',
        ru: 'Совершенствуйте произношение, интонацию и стиль речи для любого контекста',
        uz: 'Talaffuz, ohang va nutq uslubini mukammal qiling'
      },
      level: 'Advanced',
      priceBasic: 500000,
      pricePro: 700000,
      priceDeluxe: 1100000,
      published: true,
      visible: true
    },
    {
      slug: 'advanced-academic-writing',
      title: {
        en: 'Academic Writing for Advanced Learners',
        ru: 'Академическое письмо для продвинутых',
        uz: 'Ilg\'or o\'quvchilar uchun akademik yozuv'
      },
      description: {
        en: 'Master essays, research papers, and academic discourse for university level',
        ru: 'Освойте эссе, научные работы и академический дискурс университетского уровня',
        uz: 'Esse, tadqiqot ishlari va universitet darajasidagi diskursni o\'rganing'
      },
      level: 'Advanced',
      priceBasic: 480000,
      pricePro: 680000,
      priceDeluxe: 1080000,
      published: true,
      visible: true
    },
    {
      slug: 'advanced-professional-english',
      title: {
        en: 'Professional English for Advanced',
        ru: 'Профессиональный английский (Advanced)',
        uz: 'Advanced professional ingliz tili'
      },
      description: {
        en: 'Excel in international business, negotiations, and executive communication',
        ru: 'Преуспевайте в международном бизнесе, переговорах и управленческом общении',
        uz: 'Xalqaro biznes, muzokaralar va boshqaruv muloqotida muvaffaqiyatga erishing'
      },
      level: 'Advanced',
      priceBasic: 550000,
      pricePro: 750000,
      priceDeluxe: 1150000,
      published: true,
      visible: true
    },
    {
      slug: 'advanced-mock-test-intensive',
      title: {
        en: 'Advanced Mock Test Intensive',
        ru: 'Интенсивный Mock Test (Advanced)',
        uz: 'Advanced intensiv Mock Test'
      },
      description: {
        en: 'Intensive mock test training for high IELTS/TOEFL scores (7.5+)',
        ru: 'Интенсивная подготовка к mock test для высоких баллов IELTS/TOEFL (7.5+)',
        uz: 'Yuqori IELTS/TOEFL ballari uchun intensiv mock test mashg\'ulotlari (7.5+)'
      },
      level: 'Advanced',
      priceBasic: 450000,
      pricePro: 650000,
      priceDeluxe: 1050000,
      published: true,
      visible: true
    }
  ]

  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: course,
      create: course
    })
    console.log(`✅ Created/Updated: ${course.slug}`)
  }

  console.log('🎉 Seeding completed!')

  // Добавляем уроки к первому курсу (level-test)
  console.log('\n📚 Adding lessons...')

  // Пробный урок
  const trialCourse = await prisma.course.findUnique({ where: { slug: 'trial-lesson' } })
  if (trialCourse) {
    await prisma.lesson.create({
      data: {
        courseId: trialCourse.id,
        slug: 'welcome-lesson',
        title: { en: 'Welcome to English Learning', ru: 'Добро пожаловать в изучение английского', uz: 'Ingliz tilini o\'rganishga xush kelibsiz' },
        content: { en: 'Your first lesson starts here!', ru: 'Ваш первый урок начинается здесь!', uz: 'Sizning birinchi darsingingiz shu yerdan boshlanadi!' },
        order: 1,
        hasVideo: true,
        hasConspect: true,
        hasTest: false
      }
    })
    console.log('✅ Added lesson to trial-lesson')
  }

  const levelTestCourse = await prisma.course.findUnique({ where: { slug: 'level-test' } })
  if (levelTestCourse) {
    await prisma.lesson.createMany({
      data: [
        {
          courseId: levelTestCourse.id,
          slug: 'grammar-test',
          title: { en: 'Grammar Test', ru: 'Тест по грамматике', uz: 'Grammatika testi' },
          content: { en: 'Test your grammar knowledge', ru: 'Проверьте знания грамматики', uz: 'Grammatika bilimingizni tekshiring' },
          order: 1,
          hasVideo: false,
          hasConspect: false,
          hasTest: true
        },
        {
          courseId: levelTestCourse.id,
          slug: 'vocabulary-test',
          title: { en: 'Vocabulary Test', ru: 'Тест по лексике', uz: 'Lug\'at testi' },
          content: { en: 'Test your vocabulary', ru: 'Проверьте словарный запас', uz: 'Lug\'at bilimingizni tekshiring' },
          order: 2,
          hasVideo: false,
          hasConspect: false,
          hasTest: true
        },
        {
          courseId: levelTestCourse.id,
          slug: 'listening-test',
          title: { en: 'Listening Test', ru: 'Аудирование', uz: 'Tinglash testi' },
          content: { en: 'Test your listening skills', ru: 'Проверьте навык аудирования', uz: 'Tinglash ko\'nikmangizni tekshiring' },
          order: 3,
          hasVideo: true,
          hasConspect: false,
          hasTest: true
        }
      ]
    })
    console.log('✅ Added 3 lessons to level-test')
  }

  // Добавляем уроки к beginner-grammar
  const beginnerGrammar = await prisma.course.findUnique({ where: { slug: 'beginner-grammar' } })
  if (beginnerGrammar) {
    await prisma.lesson.createMany({
      data: [
        {
          courseId: beginnerGrammar.id,
          slug: 'intro-to-grammar',
          title: { en: 'Introduction to Grammar', ru: 'Введение в грамматику', uz: 'Grammatikaga kirish' },
          content: { en: 'Welcome to the course!', ru: 'Добро пожаловать на курс!', uz: 'Kursga xush kelibsiz!' },
          order: 1,
          hasVideo: true,
          hasConspect: true,
          hasTest: false
        },
        {
          courseId: beginnerGrammar.id,
          slug: 'present-simple',
          title: { en: 'Present Simple Tense', ru: 'Настоящее простое время', uz: 'Hozirgi oddiy zamon' },
          content: { en: 'Learn Present Simple', ru: 'Изучите Present Simple', uz: 'Present Simple o\'rganing' },
          order: 2,
          hasVideo: true,
          hasConspect: true,
          hasTest: true
        },
        {
          courseId: beginnerGrammar.id,
          slug: 'articles',
          title: { en: 'Articles: A, An, The', ru: 'Артикли: A, An, The', uz: 'Artikl: A, An, The' },
          content: { en: 'Master English articles', ru: 'Освойте артикли', uz: 'Artikllarni o\'rganing' },
          order: 3,
          hasVideo: true,
          hasConspect: true,
          hasTest: true
        },
        {
          courseId: beginnerGrammar.id,
          slug: 'pronouns',
          title: { en: 'Personal Pronouns', ru: 'Личные местоимения', uz: 'Shaxs olmoshlari' },
          content: { en: 'Learn pronouns', ru: 'Изучите местоимения', uz: 'Olmoshlarni o\'rganing' },
          order: 4,
          hasVideo: true,
          hasConspect: false,
          hasTest: true
        },
        {
          courseId: beginnerGrammar.id,
          slug: 'practice-session',
          title: { en: 'Practice Session', ru: 'Практическое занятие', uz: 'Amaliy mashg\'ulot' },
          content: { en: 'Practice what you learned', ru: 'Практикуйте изученное', uz: 'O\'rganganingizni mashq qiling' },
          order: 5,
          hasVideo: false,
          hasConspect: false,
          hasTest: true
        }
      ]
    })
    console.log('✅ Added 5 lessons to beginner-grammar')
  }

  console.log('\n🎊 All done!')

  // Добавляем тесты к урокам
  console.log('\n✅ Adding tests to lessons...')

  const presentSimpleLesson = await prisma.lesson.findFirst({
    where: { slug: 'present-simple' }
  })

  if (presentSimpleLesson) {
    await prisma.assignment.create({
      data: {
        lessonId: presentSimpleLesson.id,
        title: { en: 'Present Simple Quiz', ru: 'Тест по Present Simple', uz: 'Present Simple testi' },
        prompt: {
          questions: [
            {
              id: '1',
              type: 'single',
              question: 'Choose the correct form: He ___ to school every day.',
              options: ['go', 'goes', 'going', 'is going'],
              correctAnswer: 'goes'
            },
            {
              id: '2',
              type: 'single',
              question: 'Which sentence is correct?',
              options: ['She like pizza', 'She likes pizza', 'She liking pizza', 'She is like pizza'],
              correctAnswer: 'She likes pizza'
            },
            {
              id: '3',
              type: 'text',
              question: 'Write the correct form: I ___ (play) tennis on weekends.',
              correctAnswer: 'play'
            }
          ]
        }
      }
    })
    console.log('✅ Added test to present-simple')
  }

  const articlesLesson = await prisma.lesson.findFirst({
    where: { slug: 'articles' }
  })

  if (articlesLesson) {
    await prisma.assignment.create({
      data: {
        lessonId: articlesLesson.id,
        title: { en: 'Articles Quiz', ru: 'Тест по артиклям', uz: 'Artikl testi' },
        prompt: {
          questions: [
            {
              id: '1',
              type: 'single',
              question: 'Fill in: I have ___ apple.',
              options: ['a', 'an', 'the', '-'],
              correctAnswer: 'an'
            },
            {
              id: '2',
              type: 'single',
              question: 'Fill in: ___ sun is very hot today.',
              options: ['A', 'An', 'The', '-'],
              correctAnswer: 'The'
            }
          ]
        }
      }
    })
    console.log('✅ Added test to articles')
  }

  // Добавляем уроки к бесплатному mock test
  const freeMockTest = await prisma.course.findUnique({ where: { slug: 'free-mock-test-online' } })
  if (freeMockTest) {
    await prisma.lesson.createMany({
      data: [
        {
          courseId: freeMockTest.id,
          slug: 'listening-section',
          title: { en: 'Listening Section', ru: 'Аудирование', uz: 'Tinglash bo\'limi' },
          content: { en: 'IELTS Listening practice', ru: 'Практика IELTS Listening', uz: 'IELTS Tinglash mashqi' },
          order: 1,
          hasVideo: true,
          hasConspect: false,
          hasTest: true
        },
        {
          courseId: freeMockTest.id,
          slug: 'reading-section',
          title: { en: 'Reading Section', ru: 'Чтение', uz: 'O\'qish bo\'limi' },
          content: { en: 'IELTS Reading practice', ru: 'Практика IELTS Reading', uz: 'IELTS O\'qish mashqi' },
          order: 2,
          hasVideo: false,
          hasConspect: true,
          hasTest: true
        },
        {
          courseId: freeMockTest.id,
          slug: 'writing-section',
          title: { en: 'Writing Section', ru: 'Письмо', uz: 'Yozish bo\'limi' },
          content: { en: 'IELTS Writing practice', ru: 'Практика IELTS Writing', uz: 'IELTS Yozish mashqi' },
          order: 3,
          hasVideo: false,
          hasConspect: true,
          hasTest: true
        }
      ]
    })
    console.log('✅ Added 3 lessons to free-mock-test-online')
  }

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })