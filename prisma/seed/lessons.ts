import { courseIdBySlug, en3, l, opts, upsertLesson, upsertModule, type Question } from './shared'

// Демо-наполнение платных курсов. Задача — показать клиенту, как выглядит
// курс с модулями, конспектами и тестами, а не выдать готовую программу.

const ARTICLES: Question[] = [
  {
    id: 'a1',
    type: 'single',
    question: en3('I saw ___ elephant at the zoo.'),
    options: opts('a', 'an', 'the', '—'),
    correct: 'b'
  },
  {
    id: 'a2',
    type: 'single',
    question: en3('___ sun rises in the east.'),
    options: opts('A', 'An', 'The', '—'),
    correct: 'c'
  },
  {
    id: 'a3',
    type: 'single',
    question: en3('She is ___ teacher at our school.'),
    options: opts('a', 'an', 'the', '—'),
    correct: 'a'
  },
  {
    id: 'a4',
    type: 'single',
    question: en3('I like ___ music, especially jazz.'),
    options: opts('a', 'an', 'the', '—'),
    correct: 'd'
  }
]

const PRONOUNS: Question[] = [
  {
    id: 'p1',
    type: 'single',
    question: en3('This is my brother. ___ is a student.'),
    options: opts('He', 'His', 'Him', 'She'),
    correct: 'a'
  },
  {
    id: 'p2',
    type: 'single',
    question: en3('Can you help ___? I am lost.'),
    options: opts('I', 'my', 'me', 'mine'),
    correct: 'c'
  },
  {
    id: 'p3',
    type: 'single',
    question: en3('That book is ___, not yours.'),
    options: opts('my', 'mine', 'me', 'I'),
    correct: 'b'
  }
]

const WORD_ORDER: Question[] = [
  {
    id: 'w1',
    type: 'single',
    question: en3('Choose the correct sentence.'),
    options: opts(
      'Always I drink tea in the morning',
      'I drink always tea in the morning',
      'I always drink tea in the morning',
      'I drink tea always in the morning'
    ),
    correct: 'c'
  },
  {
    id: 'w2',
    type: 'single',
    question: en3('Choose the correct question.'),
    options: opts(
      'Where you live?',
      'Where do you live?',
      'Where live you?',
      'Where you do live?'
    ),
    correct: 'b'
  },
  {
    id: 'w3',
    type: 'single',
    question: en3('Put the words in order: (usually / she / at eight / gets up)'),
    options: opts(
      'She usually gets up at eight',
      'She gets up usually at eight',
      'Usually gets up she at eight',
      'She gets usually up at eight'
    ),
    correct: 'a'
  }
]

async function seedBeginnerGrammar() {
  const courseId = await courseIdBySlug('beginner-grammar')
  if (!courseId) return

  const basics = await upsertModule(courseId, {
    title: l('Модуль 1. Из чего собрано предложение', 'Modul 1. Gap nimadan tuzilgan', 'Module 1. What a sentence is made of'),
    description: l(
      'Порядок слов, местоимения и артикли — три вещи, из-за которых предложение звучит правильно или не звучит вовсе',
      'So’z tartibi, olmoshlar va artikllar — gap to’g’ri yangrashi yoki umuman yangramasligi shu uchtasiga bog’liq',
      'Word order, pronouns and articles — the three things that make a sentence sound right, or not at all'
    ),
    order: 1
  })

  const tenses = await upsertModule(courseId, {
    title: l('Модуль 2. Первое время: Present Simple', 'Modul 2. Birinchi zamon: Present Simple', 'Module 2. The first tense: Present Simple'),
    description: l(
      'Как говорить о привычном и постоянном и почему это не то же самое, что «прямо сейчас»',
      'Odatiy va doimiy narsalar haqida qanday gapirish va nega bu «hozir» bilan bir xil emas',
      'How to talk about the habitual and the permanent, and why that is not "right now"'
    ),
    order: 2
  })

  await upsertLesson(courseId, basics.id, {
    slug: 'word-order',
    title: l('Порядок слов', 'So’z tartibi', 'Word order'),
    content: l(
      `## Главное правило

В английском порядок слов жёсткий: **кто — что делает — что**. Переставить слова местами, как в русском, нельзя: смысл поменяется или предложение развалится.

- I read books every day.
- Every day I read books.

## Вопрос и отрицание

Вопрос начинается со вспомогательного глагола, отрицание строится через \`don't\` и \`doesn't\`.

1. You live in Tashkent. → Do you live in Tashkent?
2. She works here. → She doesn't work here.

> Частая ошибка: \`Where you live?\` Вспомогательный глагол нельзя пропускать даже в разговорной речи.`,
      `## Asosiy qoida

Ingliz tilida so’z tartibi qat’iy: **kim — nima qiladi — nimani**. So’zlarni o’zbekchadagidek almashtirib bo’lmaydi: ma’no o’zgaradi yoki gap buziladi.

- I read books every day.
- Every day I read books.

## So’roq va inkor

So’roq yordamchi fe’l bilan boshlanadi, inkor \`don't\` va \`doesn't\` orqali tuziladi.

1. You live in Tashkent. → Do you live in Tashkent?
2. She works here. → She doesn't work here.

> Ko’p uchraydigan xato: \`Where you live?\` Yordamchi fe’lni so’zlashuv nutqida ham tashlab bo’lmaydi.`,
      `## The main rule

English word order is fixed: **who — does what — to what**. You cannot move words around freely: the meaning changes or the sentence falls apart.

- I read books every day.
- Every day I read books.

## Questions and negatives

A question starts with an auxiliary verb; a negative uses \`don't\` or \`doesn't\`.

1. You live in Tashkent. → Do you live in Tashkent?
2. She works here. → She doesn't work here.

> Common mistake: \`Where you live?\` The auxiliary cannot be dropped, not even in speech.`
    ),
    order: 1,
    durationMin: 18
  }, {
    title: l('Тест: порядок слов', 'Test: so’z tartibi', 'Test: word order'),
    questions: WORD_ORDER
  })

  await upsertLesson(courseId, basics.id, {
    slug: 'pronouns',
    title: l('Местоимения', 'Olmoshlar', 'Pronouns'),
    content: l(
      `## Три ряда, которые путают

- Подлежащее: \`I, you, he, she, it, we, they\`
- Дополнение: \`me, you, him, her, it, us, them\`
- Притяжательные: \`my, your, his, her, its, our, their\`

## Как не ошибиться

Перед глаголом — первый ряд, после глагола или предлога — второй, перед существительным — третий.

- **She** called **me** about **her** exam.

> \`its\` — притяжательное, \`it's\` — это \`it is\`. Апостроф здесь меняет смысл целиком.`,
      `## Chalkashtiriladigan uchta qator

- Ega: \`I, you, he, she, it, we, they\`
- To’ldiruvchi: \`me, you, him, her, it, us, them\`
- Egalik: \`my, your, his, her, its, our, their\`

## Qanday xato qilmaslik kerak

Fe’ldan oldin — birinchi qator, fe’l yoki predlogdan keyin — ikkinchi, otdan oldin — uchinchi.

- **She** called **me** about **her** exam.

> \`its\` — egalik, \`it's\` — bu \`it is\`. Apostrof bu yerda ma’noni butunlay o’zgartiradi.`,
      `## The three rows people mix up

- Subject: \`I, you, he, she, it, we, they\`
- Object: \`me, you, him, her, it, us, them\`
- Possessive: \`my, your, his, her, its, our, their\`

## How to keep them straight

Before the verb — row one; after a verb or preposition — row two; before a noun — row three.

- **She** called **me** about **her** exam.

> \`its\` is possessive, \`it's\` means \`it is\`. The apostrophe changes the meaning completely.`
    ),
    order: 2,
    durationMin: 15
  }, {
    title: l('Тест: местоимения', 'Test: olmoshlar', 'Test: pronouns'),
    questions: PRONOUNS
  })

  await upsertLesson(courseId, basics.id, {
    slug: 'articles',
    title: l('Артикли a, an, the', 'Artikllar a, an, the', 'Articles a, an, the'),
    content: l(
      `## Логика в одном абзаце

\`a\` и \`an\` — «один из многих, слушатель его не знает». \`the\` — «тот самый, о котором мы оба в курсе». Если предмет вообще не выделяется, артикль не нужен.

- I bought **a** book. **The** book was about Bukhara.
- I like **—** books about history.

## Выбор между a и an

Ориентируйтесь на звук, а не на букву: \`an hour\` (звук гласный), \`a university\` (звук \`ju\`).

> Названия языков, предметов и еды в общем смысле идут без артикля: \`I study English\`, \`I like coffee\`.`,
      `## Mantiq bir xatboshida

\`a\` va \`an\` — «ko’plardan biri, tinglovchi uni bilmaydi». \`the\` — «o’sha, ikkalamiz ham biladigan». Agar predmet umuman ajratilmasa, artikl kerak emas.

- I bought **a** book. **The** book was about Bukhara.
- I like **—** books about history.

## a va an orasidagi tanlov

Harfga emas, tovushga qarang: \`an hour\` (unli tovush), \`a university\` (\`ju\` tovushi).

> Til, fan va umumiy ma’nodagi taom nomlari artiklsiz keladi: \`I study English\`, \`I like coffee\`.`,
      `## The logic in one paragraph

\`a\` and \`an\` mean "one of many, new to the listener". \`the\` means "the one we both know about". If the thing is not singled out at all, no article is needed.

- I bought **a** book. **The** book was about Bukhara.
- I like **—** books about history.

## Choosing between a and an

Go by sound, not by letter: \`an hour\` (vowel sound), \`a university\` (\`ju\` sound).

> Languages, subjects and food in general take no article: \`I study English\`, \`I like coffee\`.`
    ),
    order: 3,
    durationMin: 20
  }, {
    title: l('Тест: артикли', 'Test: artikllar', 'Test: articles'),
    questions: ARTICLES
  })

  await upsertLesson(courseId, tenses.id, {
    slug: 'present-simple-form',
    title: l('Present Simple: форма', 'Present Simple: shakl', 'Present Simple: the form'),
    content: l(
      `## Как строится

Утверждение: **подлежащее + глагол**, для he, she, it добавляется \`-s\`.

- I work / She works
- We study / He studies

## Правописание -s

1. Обычный случай: work → works
2. После \`-o, -ch, -sh, -x, -s\`: go → goes, watch → watches
3. Согласная + y: study → studies, но play → plays

> Отрицание и вопрос забирают \`-s\` себе: \`She doesn't work\`, \`Does she work?\``,
      `## Qanday tuziladi

Tasdiq: **ega + fe’l**, he, she, it uchun \`-s\` qo’shiladi.

- I work / She works
- We study / He studies

## -s ning yozilishi

1. Oddiy holat: work → works
2. \`-o, -ch, -sh, -x, -s\` dan keyin: go → goes, watch → watches
3. Undosh + y: study → studies, lekin play → plays

> Inkor va so’roq \`-s\` ni o’ziga oladi: \`She doesn't work\`, \`Does she work?\``,
      `## How it is built

Statement: **subject + verb**, with \`-s\` for he, she and it.

- I work / She works
- We study / He studies

## Spelling the -s

1. Normal case: work → works
2. After \`-o, -ch, -sh, -x, -s\`: go → goes, watch → watches
3. Consonant + y: study → studies, but play → plays

> Negatives and questions take the \`-s\` for themselves: \`She doesn't work\`, \`Does she work?\``
    ),
    order: 4,
    durationMin: 22
  }, {
    title: l('Тест: Present Simple', 'Test: Present Simple', 'Test: Present Simple'),
    questions: [
      {
        id: 'ps1',
        type: 'single',
        question: en3('He ___ television every evening.'),
        options: opts('watch', 'watches', 'watchs', 'is watch'),
        correct: 'b'
      },
      {
        id: 'ps2',
        type: 'single',
        question: en3('They ___ in a small village.'),
        options: opts('lives', 'living', 'live', 'lifes'),
        correct: 'c'
      },
      {
        id: 'ps3',
        type: 'text',
        question: en3('Type the correct form: My father ___ (study) Arabic.'),
        correct: 'studies'
      }
    ]
  })

  await upsertLesson(courseId, tenses.id, {
    slug: 'present-simple-usage',
    title: l('Present Simple: когда его используют', 'Present Simple: qachon ishlatiladi', 'Present Simple: when it is used'),
    content: l(
      `## Четыре случая

1. Привычки и распорядок: I get up at seven.
2. Постоянные факты: Water boils at 100 degrees.
3. Расписания: The train leaves at six.
4. Состояния и мнения: I know him. She likes tea.

## Чего им не говорят

Действие в момент речи — это Present Continuous.

- Right now I **am reading**, not \`I read\`.

> Глаголы \`know, like, want, need, believe\` почти не встречаются в форме \`-ing\`: они описывают состояние, а не процесс.`,
      `## To’rt holat

1. Odat va kun tartibi: I get up at seven.
2. Doimiy faktlar: Water boils at 100 degrees.
3. Jadval: The train leaves at six.
4. Holat va fikr: I know him. She likes tea.

## U bilan nima aytilmaydi

Nutq paytidagi harakat — bu Present Continuous.

- Right now I **am reading**, \`I read\` emas.

> \`know, like, want, need, believe\` fe’llari deyarli \`-ing\` shaklida uchramaydi: ular jarayonni emas, holatni bildiradi.`,
      `## Four uses

1. Habits and routines: I get up at seven.
2. Permanent facts: Water boils at 100 degrees.
3. Timetables: The train leaves at six.
4. States and opinions: I know him. She likes tea.

## What it does not do

An action at the moment of speaking is the Present Continuous.

- Right now I **am reading**, not \`I read\`.

> Verbs like \`know, like, want, need, believe\` rarely appear with \`-ing\`: they describe a state, not a process.`
    ),
    order: 5,
    durationMin: 18
  }, {
    title: l('Тест: употребление', 'Test: qo’llanishi', 'Test: usage'),
    questions: [
      {
        id: 'pu1',
        type: 'single',
        question: en3('Look! The baby ___.'),
        options: opts('sleeps', 'is sleeping', 'sleep', 'does sleep'),
        correct: 'b'
      },
      {
        id: 'pu2',
        type: 'single',
        question: en3('The museum ___ at nine every morning.'),
        options: opts('opens', 'is opening', 'open', 'has opened'),
        correct: 'a'
      },
      {
        id: 'pu3',
        type: 'single',
        question: en3('Which sentence is natural English?'),
        options: opts('I am knowing the answer', 'I know the answer', 'I am know the answer', 'I knowing the answer'),
        correct: 'b'
      }
    ]
  })

  console.log('beginner-grammar: 2 модуля, 5 уроков')
}

// Остальные курсы получают короткую, но настоящую программу: клиенту нужно
// увидеть структуру, а не пустой список.
const OUTLINES: Array<{
  slug: string
  module: { title: ReturnType<typeof l>; description: ReturnType<typeof l> }
  lessons: Array<{ slug: string; title: ReturnType<typeof l>; content: ReturnType<typeof l> }>
}> = [
  {
    slug: 'beginner-speaking',
    module: {
      title: l('Модуль 1. Первые диалоги', 'Modul 1. Birinchi dialoglar', 'Module 1. First dialogues'),
      description: l(
        'Три ситуации, которые случаются в первый же день за границей',
        'Chet elda birinchi kunning o’zida uchraydigan uchta vaziyat',
        'Three situations that happen on your first day abroad'
      )
    },
    lessons: [
      {
        slug: 'introductions',
        title: l('Знакомство', 'Tanishuv', 'Introductions'),
        content: l(
          `## Что сказать

- Hi, I'm Aziz. Nice to meet you.
- Where are you from? — I'm from Tashkent.
- What do you do? — I work in IT.

> \`How are you?\` в английском — это приветствие, а не вопрос о здоровье. Ответ \`Fine, thanks. And you?\` считается полным.`,
          `## Nima deyish kerak

- Hi, I'm Aziz. Nice to meet you.
- Where are you from? — I'm from Tashkent.
- What do you do? — I work in IT.

> Ingliz tilida \`How are you?\` — salomlashish, sog’liq haqidagi savol emas. \`Fine, thanks. And you?\` javobi to’liq hisoblanadi.`,
          `## What to say

- Hi, I'm Aziz. Nice to meet you.
- Where are you from? — I'm from Tashkent.
- What do you do? — I work in IT.

> \`How are you?\` is a greeting, not a health question. \`Fine, thanks. And you?\` counts as a complete answer.`
        )
      },
      {
        slug: 'asking-directions',
        title: l('Спросить дорогу', 'Yo’l so’rash', 'Asking for directions'),
        content: l(
          `## Вопрос

- Excuse me, how do I get to the station?
- Is it far from here?

## Ответ, который вы услышите

- Go straight on, then turn left.
- It's about ten minutes on foot.

> Начинайте с \`Excuse me\`: без него вопрос звучит резко даже с правильной грамматикой.`,
          `## Savol

- Excuse me, how do I get to the station?
- Is it far from here?

## Eshitadigan javobingiz

- Go straight on, then turn left.
- It's about ten minutes on foot.

> \`Excuse me\` bilan boshlang: usiz savol grammatikasi to’g’ri bo’lsa ham qo’pol eshitiladi.`,
          `## The question

- Excuse me, how do I get to the station?
- Is it far from here?

## The answer you will hear

- Go straight on, then turn left.
- It's about ten minutes on foot.

> Start with \`Excuse me\`: without it the question sounds blunt even with perfect grammar.`
        )
      },
      {
        slug: 'ordering-food',
        title: l('Заказать еду', 'Ovqat buyurtma qilish', 'Ordering food'),
        content: l(
          `## Вежливая форма

- Could I have a coffee, please?
- I'd like the soup, please.

## Что спросят вас

- Anything else? — No, thanks. That's all.
- How would you like to pay? — Card, please.

> \`I want a coffee\` грамматически верно, но звучит требовательно. \`I'd like\` — нейтральная норма.`,
          `## Muloyim shakl

- Could I have a coffee, please?
- I'd like the soup, please.

## Sizdan nima so’rashadi

- Anything else? — No, thanks. That's all.
- How would you like to pay? — Card, please.

> \`I want a coffee\` grammatik jihatdan to’g’ri, lekin talabchan eshitiladi. \`I'd like\` — neytral me’yor.`,
          `## The polite form

- Could I have a coffee, please?
- I'd like the soup, please.

## What you will be asked

- Anything else? — No, thanks. That's all.
- How would you like to pay? — Card, please.

> \`I want a coffee\` is grammatical but sounds demanding. \`I'd like\` is the neutral norm.`
        )
      }
    ]
  },
  {
    slug: 'pre-intermediate-grammar',
    module: {
      title: l('Модуль 1. Времена группы Perfect', 'Modul 1. Perfect zamonlar', 'Module 1. The perfect tenses'),
      description: l(
        'Место, где связь прошлого с настоящим важнее самого факта',
        'O’tmishning hozir bilan bog’liqligi faktdan muhimroq bo’lgan joy',
        'Where the link between past and present matters more than the fact itself'
      )
    },
    lessons: [
      {
        slug: 'present-perfect',
        title: l('Present Perfect', 'Present Perfect', 'Present Perfect'),
        content: l(
          `## Смысл

Present Perfect говорит не «когда», а «что это меняет сейчас».

- I have lost my keys. → их нет прямо сейчас
- I lost my keys yesterday. → просто факт из прошлого

## Маркеры

\`already\`, \`yet\`, \`just\`, \`ever\`, \`never\`, \`since\`, \`for\`

> Со словами точного времени (\`yesterday\`, \`in 2020\`) Present Perfect не используется — только Past Simple.`,
          `## Ma’nosi

Present Perfect «qachon» emas, «bu hozir nimani o’zgartiradi» degan savolga javob beradi.

- I have lost my keys. → hozir ular yo’q
- I lost my keys yesterday. → shunchaki o’tmishdagi fakt

## Belgilar

\`already\`, \`yet\`, \`just\`, \`ever\`, \`never\`, \`since\`, \`for\`

> Aniq vaqt so’zlari bilan (\`yesterday\`, \`in 2020\`) Present Perfect ishlatilmaydi — faqat Past Simple.`,
          `## The idea

The Present Perfect answers "what does it change now", not "when".

- I have lost my keys. → they are gone right now
- I lost my keys yesterday. → just a past fact

## Markers

\`already\`, \`yet\`, \`just\`, \`ever\`, \`never\`, \`since\`, \`for\`

> With exact time expressions (\`yesterday\`, \`in 2020\`) the Present Perfect is not used — only the Past Simple.`
        )
      },
      {
        slug: 'conditionals',
        title: l('Условные предложения', 'Shartli gaplar', 'Conditionals'),
        content: l(
          `## Первый и второй тип

- Реально: If it **rains**, we **will stay** at home.
- Гипотетически: If it **rained**, we **would stay** at home.

## Правило руки

После \`if\` будущее время не ставят: \`If it will rain\` — ошибка, которую слышно сразу.

> Второй тип не про прошлое, а про нереальное настоящее: \`If I were you\` — совет, а не воспоминание.`,
          `## Birinchi va ikkinchi tur

- Real: If it **rains**, we **will stay** at home.
- Faraziy: If it **rained**, we **would stay** at home.

## Oddiy qoida

\`if\` dan keyin kelasi zamon qo’yilmaydi: \`If it will rain\` — darhol seziladigan xato.

> Ikkinchi tur o’tmish haqida emas, noreal hozir haqida: \`If I were you\` — maslahat, xotira emas.`,
          `## First and second conditional

- Real: If it **rains**, we **will stay** at home.
- Hypothetical: If it **rained**, we **would stay** at home.

## Rule of thumb

No future tense after \`if\`: \`If it will rain\` is a mistake people hear immediately.

> The second conditional is not about the past but about an unreal present: \`If I were you\` is advice, not memory.`
        )
      }
    ]
  },
  {
    slug: 'intermediate-business-english',
    module: {
      title: l('Модуль 1. Переписка', 'Modul 1. Yozishmalar', 'Module 1. Correspondence'),
      description: l(
        'Письмо, на которое отвечают в тот же день',
        'O’sha kuniyoq javob beriladigan xat',
        'The email that gets answered the same day'
      )
    },
    lessons: [
      {
        slug: 'email-structure',
        title: l('Структура делового письма', 'Ish xatining tuzilishi', 'Email structure'),
        content: l(
          `## Четыре части

1. Тема: коротко и по делу — \`Meeting on 14 May: agenda\`
2. Обращение: \`Dear Ms Karimova\` или \`Hi Anna\`
3. Суть в первом абзаце: зачем вы пишете
4. Действие: чего вы ждёте и к какому сроку

## Формулировки

- I'm writing to confirm...
- Could you please send me...
- Let me know if that works for you.

> Длинное вступление снижает шанс ответа. Просьба должна читаться за десять секунд.`,
          `## To’rt qism

1. Mavzu: qisqa va aniq — \`Meeting on 14 May: agenda\`
2. Murojaat: \`Dear Ms Karimova\` yoki \`Hi Anna\`
3. Birinchi xatboshida mohiyat: nima uchun yozyapsiz
4. Harakat: nimani va qaysi muddatda kutyapsiz

## Iboralar

- I'm writing to confirm...
- Could you please send me...
- Let me know if that works for you.

> Uzun kirish javob olish ehtimolini kamaytiradi. Iltimos o’n soniyada o’qilishi kerak.`,
          `## Four parts

1. Subject: short and specific — \`Meeting on 14 May: agenda\`
2. Greeting: \`Dear Ms Karimova\` or \`Hi Anna\`
3. The point in the first paragraph: why you are writing
4. The action: what you need and by when

## Useful phrasing

- I'm writing to confirm...
- Could you please send me...
- Let me know if that works for you.

> A long preamble lowers your chance of a reply. The request should read in ten seconds.`
        )
      },
      {
        slug: 'meetings',
        title: l('Встречи и созвоны', 'Uchrashuv va qo’ng’iroqlar', 'Meetings and calls'),
        content: l(
          `## Взять слово

- Can I just add something here?
- Sorry, I'd like to come back to the previous point.

## Не согласиться мягко

- I see your point, but...
- I'm not sure that would work for us, because...

> Прямое \`No, you are wrong\` в деловой встрече считается грубым почти везде, кроме очень узких контекстов.`,
          `## So’z olish

- Can I just add something here?
- Sorry, I'd like to come back to the previous point.

## Muloyim e’tiroz

- I see your point, but...
- I'm not sure that would work for us, because...

> Ish uchrashuvida to’g’ridan-to’g’ri \`No, you are wrong\` deyish deyarli hamma joyda qo’pol sanaladi.`,
          `## Taking the floor

- Can I just add something here?
- Sorry, I'd like to come back to the previous point.

## Disagreeing gently

- I see your point, but...
- I'm not sure that would work for us, because...

> A flat \`No, you are wrong\` reads as rude in almost every business setting.`
        )
      }
    ]
  }
]

async function seedOutlines() {
  for (const outline of OUTLINES) {
    const courseId = await courseIdBySlug(outline.slug)
    if (!courseId) continue

    const module = await upsertModule(courseId, { ...outline.module, order: 1 })

    for (const [index, lesson] of outline.lessons.entries()) {
      await upsertLesson(courseId, module.id, {
        slug: lesson.slug,
        title: lesson.title,
        content: lesson.content,
        order: index + 1,
        durationMin: 15
      })
    }

    console.log(`${outline.slug}: ${outline.lessons.length} урока`)
  }
}

export async function seedCourseContent() {
  await seedBeginnerGrammar()
  await seedOutlines()
}
