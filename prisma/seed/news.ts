import { prisma } from './shared'

type Entry = {
  slug: string
  title: string
  lead: string
  body: string
}

type NewsSeed = {
  groupId: string
  daysAgo: number
  ru: Entry
  uz: Entry
  en: Entry
}

// Новости лежат отдельной записью на каждый язык, их связывает groupId —
// так в админке видно, какие переводы уже готовы, а какие нет.
const NEWS: NewsSeed[] = [
  {
    groupId: 'autumn-intake',
    daysAgo: 3,
    ru: {
      slug: 'osenniy-nabor',
      title: 'Осенний набор: группы стартуют 15 сентября',
      lead: 'Открыта запись на все уровни, от Beginner до Advanced. В группе не больше восьми человек.',
      body: `Набор на осенний семестр открыт. Занятия начинаются 15 сентября и идут до конца декабря: два раза в неделю по полтора часа, плюс материалы на платформе, доступные в любое время.

Группы формируются по результатам теста уровня. Пройти его можно бесплатно и без регистрации — на это уходит около пятнадцати минут, а результат приходит сразу.

Тем, кто занимался у нас в прошлом семестре, место в продолжающей группе сохраняется до 1 сентября. После этой даты свободные места уходят в общий набор.`
    },
    uz: {
      slug: 'kuzgi-qabul',
      title: 'Kuzgi qabul: guruhlar 15-sentabrda boshlanadi',
      lead: 'Beginner’dan Advanced’gacha barcha darajalarga yozilish ochiq. Guruhda sakkiztadan ko’p emas.',
      body: `Kuzgi semestrga qabul ochildi. Darslar 15-sentabrda boshlanib, dekabr oxirigacha davom etadi: haftasiga ikki marta bir yarim soatdan, ustiga platformadagi istalgan vaqtda ochiladigan materiallar.

Guruhlar daraja testi natijasiga qarab tuziladi. Testdan bepul va ro’yxatdan o’tmasdan o’tish mumkin — bu taxminan o’n besh daqiqa oladi, natija esa darhol chiqadi.

O’tgan semestrda bizda o’qiganlar uchun davom etuvchi guruhdagi joy 1-sentabrgacha saqlanadi. Shundan keyin bo’sh joylar umumiy qabulga chiqadi.`
    },
    en: {
      slug: 'autumn-intake',
      title: 'Autumn intake: groups start on 15 September',
      lead: 'Enrolment is open for every level, from Beginner to Advanced. Groups are capped at eight.',
      body: `Enrolment for the autumn term is open. Classes begin on 15 September and run to the end of December: twice a week for ninety minutes, plus platform materials available at any time.

Groups are formed from level test results. The test is free, needs no registration, takes about fifteen minutes, and gives you the result immediately.

Students who studied with us last term keep their place in the continuing group until 1 September. After that date, remaining seats go to the general intake.`
    }
  },
  {
    groupId: 'ielts-results',
    daysAgo: 12,
    ru: {
      slug: 'rezultaty-ielts-letney-gruppy',
      title: 'Результаты IELTS летней группы',
      lead: 'Из четырнадцати студентов одиннадцать получили 7.0 и выше, средний балл группы — 7.1.',
      body: `Летняя группа подготовки к IELTS сдала экзамен в начале августа. Одиннадцать человек из четырнадцати получили 7.0 и выше, трое — 6.5. Средний балл по группе составил 7.1 против 5.8 на входном тестировании в апреле.

Самый заметный прирост пришёлся на Writing: с 5.4 до 6.8 в среднем. Это ожидаемо — именно письменной части в группе было отведено больше всего времени, а каждая работа разбиралась преподавателем построчно.

Слабее всего рос Listening. В новом семестре мы добавили в программу ежедневные короткие задания на слух: пятнадцать минут в день дают больше, чем два часа раз в неделю.`
    },
    uz: {
      slug: 'yozgi-guruh-ielts-natijalari',
      title: 'Yozgi guruhning IELTS natijalari',
      lead: 'O’n to’rt talabadan o’n bittasi 7.0 va undan yuqori ball oldi, guruhning o’rtacha bali — 7.1.',
      body: `IELTS’ga tayyorlovchi yozgi guruh avgust boshida imtihon topshirdi. O’n to’rt kishidan o’n bittasi 7.0 va undan yuqori, uchtasi 6.5 ball oldi. Guruhning o’rtacha bali aprel oyidagi kirish testidagi 5.8 ga qarshi 7.1 ni tashkil etdi.

Eng sezilarli o’sish Writing’da bo’ldi: o’rtacha 5.4 dan 6.8 gacha. Bu kutilgan natija — guruhda aynan yozma qismga eng ko’p vaqt ajratilgan va har bir ish o’qituvchi tomonidan satrma-satr tahlil qilingan.

Eng sekin o’sgani Listening bo’ldi. Yangi semestrda dasturga har kunlik qisqa tinglash mashqlarini qo’shdik: kuniga o’n besh daqiqa haftasiga bir marta ikki soatdan ko’proq natija beradi.`
    },
    en: {
      slug: 'summer-group-ielts-results',
      title: 'IELTS results from the summer group',
      lead: 'Eleven of fourteen students scored 7.0 or above; the group average was 7.1.',
      body: `The summer IELTS preparation group sat the exam in early August. Eleven of the fourteen scored 7.0 or above and three scored 6.5. The group average was 7.1, up from 5.8 at the entry test in April.

The largest gain was in Writing: from 5.4 to 6.8 on average. That was expected — writing took the largest share of class time, and every piece of work was marked line by line.

Listening improved the least. For the new term we have added short daily listening tasks: fifteen minutes a day does more than two hours once a week.`
    }
  },
  {
    groupId: 'speaking-club',
    daysAgo: 21,
    ru: {
      slug: 'razgovornyy-klub-po-chetvergam',
      title: 'Разговорный клуб по четвергам — бесплатно для студентов',
      lead: 'Час живого разговора без учебника. Тему объявляем за день, приходить можно с любого уровня от Elementary.',
      body: `Каждый четверг в 19:00 мы собираемся на разговорный клуб. Формат простой: одна тема, небольшие группы по четыре человека, смена собеседника каждые пятнадцать минут. Преподаватель не ведёт занятие, а слушает и в конце разбирает типичные ошибки.

Клуб бесплатный для всех, кто занимается на любом тарифе. Записываться заранее не нужно, но мест в аудитории двадцать — приходите чуть раньше.

Уровень от Elementary. Ниже пока тяжело: без базовой лексики час разговора превращается в час молчания, и это скорее демотивирует.`
    },
    uz: {
      slug: 'payshanba-suhbat-klubi',
      title: 'Payshanba kunlari suhbat klubi — talabalar uchun bepul',
      lead: 'Darslliksiz bir soatlik jonli suhbat. Mavzuni bir kun oldin e’lon qilamiz, Elementary’dan yuqori istalgan daraja kelishi mumkin.',
      body: `Har payshanba soat 19:00 da suhbat klubiga yig’ilamiz. Format oddiy: bitta mavzu, to’rt kishilik kichik guruhlar, har o’n besh daqiqada suhbatdosh almashadi. O’qituvchi dars o’tmaydi, balki tinglaydi va oxirida tipik xatolarni tahlil qiladi.

Klub istalgan tarifda o’qiyotganlar uchun bepul. Oldindan yozilish shart emas, lekin auditoriyada yigirmata joy bor — sal erta keling.

Daraja Elementary’dan boshlab. Undan past bo’lsa hozircha qiyin: asosiy lug’atsiz bir soatlik suhbat bir soatlik sukunatga aylanadi.`
    },
    en: {
      slug: 'thursday-speaking-club',
      title: 'Thursday speaking club — free for our students',
      lead: 'An hour of real conversation with no textbook. The topic goes out a day ahead; Elementary and above welcome.',
      body: `Every Thursday at 19:00 we run a speaking club. The format is simple: one topic, small groups of four, and a new partner every fifteen minutes. The teacher does not lead the session — they listen, and go through the common mistakes at the end.

The club is free for anyone studying on any plan. No booking is needed, but the room holds twenty people, so come a little early.

Elementary and above. Below that it is hard going: without basic vocabulary an hour of conversation becomes an hour of silence, which discourages more than it helps.`
    }
  },
  {
    groupId: 'platform-progress',
    daysAgo: 34,
    ru: {
      slug: 'progress-i-konspekty-na-platforme',
      title: 'На платформе появились конспекты и отслеживание прогресса',
      lead: 'Теперь видно, на каком шаге вы остановились, и можно вернуться к нужному уроку одной кнопкой.',
      body: `Мы переработали учебную зону. У каждого урока теперь три шага: видео, конспект и тест. Конспект — это не расшифровка видео, а короткая выжимка с правилом, примерами и разбором частой ошибки.

Прогресс сохраняется по шагам, а не по урокам целиком. Если вы закрыли вкладку на середине теста, кнопка «Продолжить» вернёт вас именно туда, а не в начало курса.

Уроки внутри курса собраны в модули. Следующий модуль открывается после предыдущего — это защита от привычки перепрыгивать через темы, которая почти всегда возвращается пробелами.`
    },
    uz: {
      slug: 'platformada-konspekt-va-jarayon',
      title: 'Platformada konspektlar va jarayonni kuzatish paydo bo’ldi',
      lead: 'Endi qaysi qadamda to’xtaganingiz ko’rinadi va kerakli darsga bitta tugma bilan qaytish mumkin.',
      body: `Biz o’quv zonasini qayta ishladik. Har bir darsda endi uchta qadam bor: video, konspekt va test. Konspekt — videoning matni emas, balki qoida, misollar va tipik xato tahlili bilan qisqa mazmun.

Jarayon dars bo’yicha emas, qadam bo’yicha saqlanadi. Agar testning o’rtasida oynani yopgan bo’lsangiz, «Davom etish» tugmasi sizni kurs boshiga emas, aynan o’sha joyga qaytaradi.

Kurs ichidagi darslar modullarga yig’ilgan. Keyingi modul avvalgisidan keyin ochiladi — bu mavzular ustidan sakrab o’tish odatidan himoya, chunki u deyarli har doim bo’shliq bo’lib qaytadi.`
    },
    en: {
      slug: 'notes-and-progress-on-the-platform',
      title: 'Lesson notes and progress tracking are live',
      lead: 'You can now see which step you stopped on and jump straight back to it.',
      body: `We have rebuilt the learning area. Every lesson now has three steps: video, notes and a test. The notes are not a transcript of the video but a short digest with the rule, examples, and the mistake people usually make.

Progress is saved per step, not per lesson. If you closed the tab halfway through a test, the "Continue" button takes you back to that exact point rather than to the start of the course.

Lessons are grouped into modules, and the next module opens once the previous one is done. That is deliberate protection against skipping topics — skipped topics almost always come back as gaps.`
    }
  }
]

export async function seedNews() {
  const now = Date.now()

  for (const item of NEWS) {
    const publishedAt = new Date(now - item.daysAgo * 24 * 60 * 60 * 1000)

    for (const locale of ['ru', 'uz', 'en'] as const) {
      const entry = item[locale]
      const data = {
        groupId: item.groupId,
        title: entry.title,
        lead: entry.lead,
        body: entry.body,
        metaTitle: entry.title,
        metaDescription: entry.lead,
        published: true,
        publishedAt
      }

      await prisma.news.upsert({
        where: { locale_slug: { locale, slug: entry.slug } },
        update: data,
        create: { locale, slug: entry.slug, ...data }
      })
    }
  }

  console.log(`новости: ${NEWS.length} штуки на трёх языках`)
}
