import { courseIdBySlug, en3, l, opts, upsertLesson, type Question } from './shared'

// --- Пробный урок --------------------------------------------------------
// Один настоящий урок целиком: слот под видео, конспект и тест. Всё это
// редактируется в админке, здесь только начальное наполнение.

const TRIAL_CONSPECT = l(
  `## Что разберём за урок

Present Simple — время, которым говорят о постоянном: о работе, привычках, расписании и фактах. Его учат первым и дольше всего продолжают в нём ошибаться.

## Правило в одну строку

Утверждение строится как **подлежащее + глагол**. Для he, she, it к глаголу добавляется \`-s\`.

- I work in a bank.
- She works in a bank.
- They work in a bank.

## Где теряют баллы

Отрицание и вопрос строятся через \`do\` и \`does\`. Окончание \`-s\` уходит к вспомогательному глаголу, а смысловой возвращается в начальную форму.

- He **doesn't work** on Sunday — не \`doesn't works\`
- **Does** she **speak** English? — не \`Does she speaks\`

## Слова-подсказки

Рядом с Present Simple почти всегда стоят слова частоты: \`always\`, \`usually\`, \`often\`, \`sometimes\`, \`never\`. Они идут перед смысловым глаголом, но после \`to be\`.

- I usually get up at seven.
- He is always late.

> Самая частая ошибка: Present Simple не описывает то, что происходит прямо сейчас. «Я сейчас читаю» — это \`I am reading\`, а не \`I read\`.

## Что сделать после урока

1. Напишите пять предложений о своём обычном дне.
2. Переделайте каждое в отрицание и в вопрос.
3. Проверьте себя тестом на следующем шаге.`,

  `## Darsda nimani ko’rib chiqamiz

Present Simple — doimiy narsalar haqida gapiriladigan zamon: ish, odat, jadval va faktlar. U birinchi bo’lib o’rganiladi va eng uzoq vaqt xato qilinadigan zamon bo’lib qoladi.

## Bir qatorli qoida

Tasdiq gap **ega + fe’l** tarzida tuziladi. He, she, it uchun fe’lga \`-s\` qo’shiladi.

- I work in a bank.
- She works in a bank.
- They work in a bank.

## Ball qayerda yo’qoladi

Inkor va so’roq \`do\` va \`does\` orqali tuziladi. \`-s\` yordamchi fe’lga o’tadi, ma’noli fe’l esa boshlang’ich shaklga qaytadi.

- He **doesn't work** on Sunday — \`doesn't works\` emas
- **Does** she **speak** English? — \`Does she speaks\` emas

## Ishora beruvchi so’zlar

Present Simple yonida deyarli doim chastota so’zlari turadi: \`always\`, \`usually\`, \`often\`, \`sometimes\`, \`never\`. Ular ma’noli fe’ldan oldin, lekin \`to be\` dan keyin keladi.

- I usually get up at seven.
- He is always late.

> Eng ko’p uchraydigan xato: Present Simple hozir sodir bo’layotgan ishni tasvirlamaydi. «Men hozir o’qiyapman» — bu \`I am reading\`, \`I read\` emas.

## Darsdan keyin nima qilish kerak

1. Odatdagi kuningiz haqida beshta gap yozing.
2. Har birini inkor va so’roq shakliga o’tkazing.
3. Keyingi qadamdagi test bilan o’zingizni tekshiring.`,

  `## What this lesson covers

The Present Simple is the tense for permanent things: work, habits, timetables and facts. It is the first tense learners meet and the last one they stop getting wrong.

## The rule in one line

A statement is **subject + verb**. For he, she and it, the verb takes \`-s\`.

- I work in a bank.
- She works in a bank.
- They work in a bank.

## Where marks are lost

Negatives and questions use \`do\` and \`does\`. The \`-s\` moves to the auxiliary and the main verb goes back to its base form.

- He **doesn't work** on Sunday — not \`doesn't works\`
- **Does** she **speak** English? — not \`Does she speaks\`

## Signal words

The Present Simple almost always travels with frequency words: \`always\`, \`usually\`, \`often\`, \`sometimes\`, \`never\`. They go before the main verb but after \`to be\`.

- I usually get up at seven.
- He is always late.

> The most common mistake: the Present Simple does not describe what is happening right now. "I am reading" is not "I read".

## After the lesson

1. Write five sentences about your ordinary day.
2. Turn each one into a negative and a question.
3. Check yourself with the test on the next step.`
)

const TRIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'single',
    question: l(
      'Выберите верную форму: My sister ___ at a hospital.',
      'To’g’ri shaklni tanlang: My sister ___ at a hospital.',
      'Choose the correct form: My sister ___ at a hospital.'
    ),
    options: opts('work', 'works', 'working', 'is work'),
    correct: 'b'
  },
  {
    id: 'q2',
    type: 'single',
    question: l(
      'Какое предложение построено верно?',
      'Qaysi gap to’g’ri tuzilgan?',
      'Which sentence is correct?'
    ),
    options: opts(
      "He doesn't works on Friday",
      "He don't work on Friday",
      "He doesn't work on Friday",
      "He not work on Friday"
    ),
    correct: 'c'
  },
  {
    id: 'q3',
    type: 'single',
    question: l(
      'Поставьте вопрос: ___ your brother speak English?',
      'Savol tuzing: ___ your brother speak English?',
      'Make a question: ___ your brother speak English?'
    ),
    options: opts('Do', 'Does', 'Is', 'Are'),
    correct: 'b'
  },
  {
    id: 'q4',
    type: 'single',
    question: l(
      'Где стоит слово частоты: I ___ drink coffee in the evening.',
      'Chastota so’zi qayerda turadi: I ___ drink coffee in the evening.',
      'Where does the frequency word go: I ___ drink coffee in the evening.'
    ),
    options: opts('never', 'not never', 'am never', 'never not'),
    correct: 'a'
  },
  {
    id: 'q5',
    type: 'text',
    question: l(
      'Впишите верную форму глагола: She ___ (go) to the gym twice a week.',
      'Fe’lning to’g’ri shaklini yozing: She ___ (go) to the gym twice a week.',
      'Type the correct form: She ___ (go) to the gym twice a week.'
    ),
    correct: 'goes'
  }
]

async function seedTrialLesson() {
  const courseId = await courseIdBySlug('trial-lesson')
  if (!courseId) return

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'present-simple',
      title: l(
        'Present Simple: о том, что происходит обычно',
        'Present Simple: odatda sodir bo’ladigan narsalar haqida',
        'Present Simple: talking about what usually happens'
      ),
      content: TRIAL_CONSPECT,
      order: 1,
      hasVideo: true,
      hasConspect: true,
      durationMin: 20
    },
    {
      title: l('Проверка: Present Simple', 'Tekshiruv: Present Simple', 'Check: Present Simple'),
      questions: TRIAL_QUESTIONS
    }
  )

  console.log('пробный урок: 1 урок + тест')
}

// --- Тест уровня ---------------------------------------------------------
// Три раздела по восемь вопросов, сложность растёт от A1 к C1. Границы уровней
// в FreeLevelTestPlayer рассчитаны именно на такой банк.

const GRAMMAR: Question[] = [
  {
    id: 'g1',
    type: 'single',
    question: en3('My name ___ Aziza and I ___ from Tashkent.'),
    options: opts('is / am', 'am / is', 'is / is', 'are / am'),
    correct: 'a'
  },
  {
    id: 'g2',
    type: 'single',
    question: en3('There ___ a lot of people in the street yesterday.'),
    options: opts('was', 'were', 'is', 'have been'),
    correct: 'b'
  },
  {
    id: 'g3',
    type: 'single',
    question: en3('We ___ to Samarkand last summer.'),
    options: opts('go', 'gone', 'went', 'have go'),
    correct: 'c'
  },
  {
    id: 'g4',
    type: 'single',
    question: en3('This bag is ___ than the other one.'),
    options: opts('more cheap', 'cheaper', 'cheapest', 'the most cheap'),
    correct: 'b'
  },
  {
    id: 'g5',
    type: 'single',
    question: en3("I ___ this film before, so I know how it ends."),
    options: opts('saw', 'have seen', 'see', 'was seeing'),
    correct: 'b'
  },
  {
    id: 'g6',
    type: 'single',
    question: en3('If I ___ more time, I would learn another language.'),
    options: opts('have', 'had', 'would have', 'will have'),
    correct: 'b'
  },
  {
    id: 'g7',
    type: 'single',
    question: en3('She told me that she ___ the report by Friday.'),
    options: opts('will finish', 'would finish', 'finishes', 'has finished'),
    correct: 'b'
  },
  {
    id: 'g8',
    type: 'single',
    question: en3('Not only ___ the deadline, but he also lost the file.'),
    options: opts('he missed', 'did he miss', 'he did miss', 'missed he'),
    correct: 'b'
  }
]

const VOCABULARY: Question[] = [
  {
    id: 'v1',
    type: 'single',
    question: en3('Choose the opposite of "expensive".'),
    options: opts('cheap', 'rich', 'small', 'heavy'),
    correct: 'a'
  },
  {
    id: 'v2',
    type: 'single',
    question: en3("I'd like to ___ a table for two, please."),
    options: opts('order', 'book', 'take', 'buy'),
    correct: 'b'
  },
  {
    id: 'v3',
    type: 'single',
    question: en3('We need to ___ a decision before Monday.'),
    options: opts('do', 'make', 'take out', 'give'),
    correct: 'b'
  },
  {
    id: 'v4',
    type: 'single',
    question: en3('The meeting was called ___ because of the storm.'),
    options: opts('off', 'out', 'over', 'up'),
    correct: 'a'
  },
  {
    id: 'v5',
    type: 'single',
    question: en3('"To postpone something" is closest in meaning to:'),
    options: opts('to put it off', 'to put it on', 'to put it away', 'to put it down'),
    correct: 'a'
  },
  {
    id: 'v6',
    type: 'single',
    question: en3('A person who is "reluctant" to do something:'),
    options: opts('is eager to do it', 'is unwilling to do it', 'is unable to do it', 'is paid to do it'),
    correct: 'b'
  },
  {
    id: 'v7',
    type: 'single',
    question: en3('"A ballpark figure" means:'),
    options: opts('an exact total', 'a rough estimate', 'a written contract', 'a sports result'),
    correct: 'b'
  },
  {
    id: 'v8',
    type: 'single',
    question: en3('The evidence was ___, so the case was dropped.'),
    options: opts('inconclusive', 'inconsiderate', 'incomparable', 'incoherent'),
    correct: 'a'
  }
]

const READING_TEXT = `Remote work was once a rare privilege. In 2020 it became the default for millions of office employees almost overnight, and companies discovered that most of the work got done anyway. Five years later the picture is more complicated. Productivity in individual tasks has held up well, but managers report that new employees take noticeably longer to feel part of a team, and that informal knowledge — the kind that used to travel across a desk — now has to be written down or it disappears.

Most large employers have settled on a hybrid arrangement: two or three fixed days in the office, the rest wherever the employee prefers. Staff surveys consistently show that the flexibility, rather than the saved commute, is what people value most. The companies that tried to reverse course entirely have found recruiting harder, especially for experienced specialists who now treat remote days as part of the salary.`

const READING: Question[] = [
  {
    id: 'r1',
    type: 'single',
    question: en3('According to the text, what happened in 2020?'),
    options: opts(
      'Remote work became normal for many office employees',
      'Companies stopped hiring new employees',
      'Productivity fell sharply in every industry',
      'Most offices were closed permanently'
    ),
    correct: 'a'
  },
  {
    id: 'r2',
    type: 'single',
    question: en3('What does the text say about productivity in individual tasks?'),
    options: opts('It collapsed', 'It stayed strong', 'It was never measured', 'It doubled'),
    correct: 'b'
  },
  {
    id: 'r3',
    type: 'single',
    question: en3('What problem do managers report?'),
    options: opts(
      'New employees need longer to feel part of a team',
      'Employees refuse to use email',
      'Offices became too expensive',
      'Nobody wants to be promoted'
    ),
    correct: 'a'
  },
  {
    id: 'r4',
    type: 'single',
    question: en3('"Informal knowledge" in the text refers to:'),
    options: opts(
      'official company policies',
      'things people used to learn from colleagues nearby',
      'training courses paid for by the employer',
      'information stored in customer databases'
    ),
    correct: 'b'
  },
  {
    id: 'r5',
    type: 'single',
    question: en3('What arrangement have most large employers chosen?'),
    options: opts(
      'Fully remote work',
      'A fixed number of office days per week',
      'A return to five days in the office',
      'Different rules for every employee'
    ),
    correct: 'b'
  },
  {
    id: 'r6',
    type: 'single',
    question: en3('According to staff surveys, what do employees value most?'),
    options: opts('The saved commute', 'The flexibility', 'A larger desk', 'Shorter meetings'),
    correct: 'b'
  },
  {
    id: 'r7',
    type: 'single',
    question: en3('What happened to companies that ended remote work completely?'),
    options: opts(
      'They found it harder to recruit',
      'They increased their profits',
      'They hired more experienced specialists',
      'They moved to smaller offices'
    ),
    correct: 'a'
  },
  {
    id: 'r8',
    type: 'single',
    question: en3('The phrase "treat remote days as part of the salary" suggests that specialists:'),
    options: opts(
      'are paid extra for working at home',
      'count remote days as part of what the job pays them',
      'work fewer hours than office staff',
      'prefer cash bonuses to flexible hours'
    ),
    correct: 'b'
  }
]

async function seedLevelTest() {
  const courseId = await courseIdBySlug('level-test')
  if (!courseId) return

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'grammar',
      title: l('Грамматика', 'Grammatika', 'Grammar'),
      content: l(
        'Восемь вопросов от простых форм до конструкций уровня C1.',
        'Oddiy shakllardan C1 darajasidagi tuzilmalargacha sakkizta savol.',
        'Eight questions, from basic forms to C1 structures.'
      ),
      order: 1,
      hasVideo: false,
      hasConspect: false
    },
    {
      title: l('Раздел: грамматика', 'Bo’lim: grammatika', 'Section: grammar'),
      questions: GRAMMAR
    }
  )

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'vocabulary',
      title: l('Лексика', 'Lug’at', 'Vocabulary'),
      content: l(
        'Слова, устойчивые сочетания и фразовые глаголы — то, что чаще всего подводит в разговоре.',
        'So’zlar, barqaror birikmalar va frazali fe’llar — suhbatda ko’pincha qiynaydigan narsa.',
        'Words, collocations and phrasal verbs — what usually lets people down in conversation.'
      ),
      order: 2,
      hasVideo: false,
      hasConspect: false
    },
    {
      title: l('Раздел: лексика', 'Bo’lim: lug’at', 'Section: vocabulary'),
      questions: VOCABULARY
    }
  )

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'reading',
      title: l('Чтение', 'O’qish', 'Reading'),
      content: l(
        `Прочитайте текст и ответьте на восемь вопросов.\n\n${READING_TEXT}`,
        `Matnni o’qing va sakkizta savolga javob bering.\n\n${READING_TEXT}`,
        `Read the text and answer eight questions.\n\n${READING_TEXT}`
      ),
      order: 3,
      hasVideo: false,
      hasConspect: true
    },
    {
      title: l('Раздел: чтение', 'Bo’lim: o’qish', 'Section: reading'),
      questions: READING
    }
  )

  console.log('тест уровня: 3 раздела по 8 вопросов')
}

// --- Пробный mock test ---------------------------------------------------

const MOCK_READING_TEXT = `The city of Bukhara has lived through several economies. For centuries it prospered as a stop on the trade routes between China and the Mediterranean, and its wealth came almost entirely from goods that were merely passing through. When sea routes replaced the caravans, that income disappeared within two generations, and the city survived on regional crafts instead.

Tourism has now taken the place of trade. The restoration programme that began in the 1990s brought visitors back, but it also created a familiar difficulty: the buildings that attract tourists are expensive to maintain, and the money needed for that maintenance depends on the tourists continuing to arrive. Local authorities have started encouraging craft workshops and small manufacturing so that the city does not rest on a single source of income for a third time.`

const MOCK_READING: Question[] = [
  {
    id: 'mr1',
    type: 'single',
    question: en3('What was the historical source of Bukhara\'s wealth?'),
    options: opts(
      'Goods passing through on trade routes',
      'Farming on the surrounding land',
      'Taxes paid by local craftsmen',
      'Silver mined nearby'
    ),
    correct: 'a'
  },
  {
    id: 'mr2',
    type: 'single',
    question: en3('Why did that income disappear?'),
    options: opts(
      'Sea routes replaced the caravans',
      'The crafts industry collapsed',
      'The city was destroyed',
      'Traders moved to Samarkand'
    ),
    correct: 'a'
  },
  {
    id: 'mr3',
    type: 'single',
    question: en3('How quickly did the change happen?'),
    options: opts('Within a single year', 'Within two generations', 'Over five centuries', 'The text does not say'),
    correct: 'b'
  },
  {
    id: 'mr4',
    type: 'single',
    question: en3('What difficulty does the restoration programme create?'),
    options: opts(
      'Maintenance depends on tourists continuing to come',
      'Tourists damage the buildings deliberately',
      'Local people have left the old city',
      'The programme was never finished'
    ),
    correct: 'a'
  },
  {
    id: 'mr5',
    type: 'single',
    question: en3('Why are the authorities encouraging workshops and small manufacturing?'),
    options: opts(
      'To avoid depending on one source of income again',
      'To replace tourism completely',
      'To attract foreign investors',
      'To reduce the cost of restoration'
    ),
    correct: 'a'
  },
  {
    id: 'mr6',
    type: 'single',
    question: en3('The phrase "for a third time" refers to:'),
    options: opts(
      'a third restoration programme',
      'a third period of relying on one industry',
      'the third century of trade',
      'a third group of visitors'
    ),
    correct: 'b'
  }
]

const MOCK_GRAMMAR: Question[] = [
  {
    id: 'mg1',
    type: 'single',
    question: en3('By the time the results ___, most candidates had left the hall.'),
    options: opts('announced', 'were announced', 'have announced', 'are announcing'),
    correct: 'b'
  },
  {
    id: 'mg2',
    type: 'single',
    question: en3('The report, ___ was written in a hurry, contained several errors.'),
    options: opts('that', 'which', 'what', 'who'),
    correct: 'b'
  },
  {
    id: 'mg3',
    type: 'single',
    question: en3('She would rather ___ at home this weekend.'),
    options: opts('to stay', 'staying', 'stay', 'stayed'),
    correct: 'c'
  },
  {
    id: 'mg4',
    type: 'single',
    question: en3('___ the rain, the match went ahead as planned.'),
    options: opts('Despite', 'Although', 'However', 'Because of'),
    correct: 'a'
  },
  {
    id: 'mg5',
    type: 'single',
    question: en3('If she ___ the earlier train, she would be here by now.'),
    options: opts('took', 'had taken', 'takes', 'has taken'),
    correct: 'b'
  },
  {
    id: 'mg6',
    type: 'single',
    question: en3('The committee has yet ___ its final decision.'),
    options: opts('announcing', 'announced', 'to announce', 'announce'),
    correct: 'c'
  }
]

const MOCK_VOCABULARY: Question[] = [
  {
    id: 'mv1',
    type: 'single',
    question: en3('The results were broadly ___ with our earlier findings.'),
    options: opts('consistent', 'constant', 'confident', 'continuous'),
    correct: 'a'
  },
  {
    id: 'mv2',
    type: 'single',
    question: en3('The company had to ___ costs after a difficult quarter.'),
    options: opts('cut down on', 'cut up', 'cut in', 'cut across'),
    correct: 'a'
  },
  {
    id: 'mv3',
    type: 'single',
    question: en3('A "significant increase" is best replaced by:'),
    options: opts('a slight rise', 'a marked rise', 'a steady state', 'a small drop'),
    correct: 'b'
  },
  {
    id: 'mv4',
    type: 'single',
    question: en3('The argument was ___: it convinced almost everyone in the room.'),
    options: opts('compelling', 'compulsory', 'competitive', 'complimentary'),
    correct: 'a'
  },
  {
    id: 'mv5',
    type: 'single',
    question: en3('Choose the word closest in meaning to "sustain".'),
    options: opts('maintain', 'obtain', 'contain', 'detain'),
    correct: 'a'
  },
  {
    id: 'mv6',
    type: 'single',
    question: en3('The data ___ the theory rather than proving it outright.'),
    options: opts('supports', 'supposes', 'suppresses', 'supplies'),
    correct: 'a'
  }
]

async function seedMockTest() {
  const courseId = await courseIdBySlug('free-mock-test-online')
  if (!courseId) return

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'reading',
      title: l('Reading', 'Reading', 'Reading'),
      content: l(
        `Прочитайте текст и ответьте на шесть вопросов.\n\n${MOCK_READING_TEXT}`,
        `Matnni o’qing va oltita savolga javob bering.\n\n${MOCK_READING_TEXT}`,
        `Read the text and answer six questions.\n\n${MOCK_READING_TEXT}`
      ),
      order: 1,
      hasVideo: false,
      hasConspect: true
    },
    { title: l('Раздел: Reading', 'Bo’lim: Reading', 'Section: Reading'), questions: MOCK_READING }
  )

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'grammar',
      title: l('Grammar', 'Grammar', 'Grammar'),
      content: l(
        'Шесть вопросов на конструкции, которые чаще всего встречаются в экзаменационных текстах.',
        'Imtihon matnlarida eng ko’p uchraydigan tuzilmalar bo’yicha oltita savol.',
        'Six questions on the structures exam texts lean on most.'
      ),
      order: 2,
      hasVideo: false,
      hasConspect: false
    },
    { title: l('Раздел: Grammar', 'Bo’lim: Grammar', 'Section: Grammar'), questions: MOCK_GRAMMAR }
  )

  await upsertLesson(
    courseId,
    null,
    {
      slug: 'vocabulary',
      title: l('Vocabulary', 'Vocabulary', 'Vocabulary'),
      content: l(
        'Академическая лексика: слова, которые легко перепутать между собой.',
        'Akademik lug’at: bir-biri bilan oson adashtiriladigan so’zlar.',
        'Academic vocabulary: the words that are easiest to confuse.'
      ),
      order: 3,
      hasVideo: false,
      hasConspect: false
    },
    { title: l('Раздел: Vocabulary', 'Bo’lim: Vocabulary', 'Section: Vocabulary'), questions: MOCK_VOCABULARY }
  )

  console.log('mock test: 3 раздела')
}

export async function seedFreeZone() {
  await seedTrialLesson()
  await seedLevelTest()
  await seedMockTest()
}
