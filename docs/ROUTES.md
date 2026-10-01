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
| `/news`, `/news/[slug]` | в стиле сайта + синхронизация с Instagram | ⬜ (оставляем) |
| `/signup` | SignUp | ✅ |
| `/signin`, `/forgot-password`, `/reset-password`, `/resend-verification` | в стиле SignUp | ✅ |
| `/level-test` (группа `(focus)`), `/level-test/[lesson]` → редирект | LevelTest | ✅ |
| `/trial-lesson` | Lesson (пробный) | ⬜ |
| ~~`/free-mock-test`~~ | — | 🗑 удалено |
| `/l/[campaign]` | Landing | ✅ |
| `/r/[token]` | Report | ✅ |

## Учёба (AppShell: градиент, плавающая панель, сайдбар)

| Адрес | Артборд | Статус |
|---|---|---|
| `/learn` | Learn, LearnMobile, LearnMobileDark | ⬜ |
| `/learn/[slug]` | Program | ⬜ |
| `/learn/[slug]/about` | Course (вкладка «О курсе») | ⬜ |
| `/learn/[slug]/[lesson]` | Lesson, LessonMobile, Quiz | ⬜ |
| `/learn/[slug]/exam/[moduleId]` | Quiz | ⬜ |
| `/streams`, `/streams/[id]` | Live | ⬜ |
| `/account`, `/learn/account`, `/account/phone` | Account | ⬜ |
| ~~Шаг «Диалог»~~ | — | 🗑 удалено (на будущее) |

## Преподаватель и админка (StaffShell: тёмная рейка)

| Адрес | Артборд | Статус |
|---|---|---|
| `/teacher/groups/[id]` | Teacher | ⬜ |
| остальные `/teacher/*` | в стиле Teacher | ⬜ |
| `/admin` | Admin | ⬜ |
| остальные `/admin/*` (курсы, уроки, студенты, эфиры) | в стиле Admin | ⬜ |
| `/admin/news*` | в стиле Admin | ⬜ (оставляем) |

## Только редиректы (оставляем как есть)

`/dashboard` → `/learn`, `/free-lesson` → `/trial-lesson`,
`/courses/[slug]/lessons/[lesson]` → `/learn/...`.
