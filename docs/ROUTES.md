# Карта страниц → холст

Статус: ⬜ не начато · 🟨 в работе · ✅ перенесено · ❓ нет на холсте, решает владелец

## Сайт

| Адрес | Артборд | Статус |
|---|---|---|
| `/` | Home, HomeMobile | ✅ |
| `/courses` | Courses | ✅ |
| `/courses/[slug]` | Course | ✅ |
| `/teachers` | Teachers | ✅ |
| `/teachers/[slug]` | в стиле крупного блока Teachers | ⬜ (оставляем) |
| `/results` | Results | ✅ |
| `/certificate` → `/results#certificate`, `/certificate/[serial]` | Results (блок проверки), Certificate | ✅ |
| `/about` | «О нас и контакты» | ✅ |
| `/contacts` | → редирект на `/about` | ✅ |
| `/news`, `/news/[slug]` | в стиле сайта + синхронизация с Instagram | ✅ (Instagram ждёт ключ) |
| `/signup` | SignUp | ✅ |
| `/signin`, `/forgot-password`, `/reset-password`, `/resend-verification` | в стиле SignUp | ✅ |
| `/level-test` (группа `(focus)`), `/level-test/[lesson]` → редирект | LevelTest | ✅ |
| `/trial-lesson` (группа `(focus)`) | Lesson (пробный) | ✅ |
| ~~`/free-mock-test`~~ | — | 🗑 удалено |
| `/l/[campaign]` | Landing | ✅ |
| `/r/[token]` | Report | ✅ |

## Учёба (AppShell: градиент, плавающая панель, сайдбар)

| Адрес | Артборд | Статус |
|---|---|---|
| `/learn` | Learn, LearnMobile, LearnMobileDark | ✅ |
| `/learn/[slug]` | Program | ✅ |
| `/learn/[slug]/about` | Course (вкладка «О курсе») | ✅ |
| `/learn/[slug]/[lesson]` | Lesson, LessonMobile, Quiz | ✅ |
| `/learn/[slug]/exam/[moduleId]` | Quiz (без подсказок по ходу) | ✅ |
| `/streams`, `/streams/[id]` | Live (гость — в шапке сайта) | ✅ |
| `/learn/account` (+ `/account` → редирект), `/account/phone`, `/learn/tasks` | Account, сайдбар «Задания» | ✅ |
| ~~Шаг «Диалог»~~ | — | 🗑 удалено (на будущее) |

## Преподаватель и админка (StaffShell: тёмная рейка)

| Адрес | Артборд | Статус |
|---|---|---|
| `/teacher/groups/[id]` | Teacher (журнал `GroupJournal`) | ✅ |
| `/teacher` | «Расписание» в стиле Teacher | ✅ |
| остальные `/teacher/*` | набор `features/staff/kit.css` | 🟨 стили v2, вёрстка старая |
| `/admin` | Admin | ✅ |
| остальные `/admin/*` (курсы, уроки, студенты, эфиры) | набор `features/staff/kit.css` | 🟨 стили v2, вёрстка старая |
| `/admin/news*` | в стиле Admin, панель Instagram | ✅ |

## Только редиректы (оставляем как есть)

`/dashboard` → `/learn`, `/free-lesson` → `/trial-lesson`,
`/courses/[slug]/lessons/[lesson]` → `/learn/...`.
