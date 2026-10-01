# Карта страниц → холст

Статус: ⬜ не начато · 🟨 в работе · ✅ перенесено · ❓ нет на холсте, решает владелец

## Сайт

| Адрес | Артборд | Статус |
|---|---|---|
| `/` | Home, HomeMobile | ✅ |
| `/courses` | Courses | ⬜ |
| `/courses/[slug]` | Course | ⬜ |
| `/teachers` | Teachers | ⬜ |
| `/teachers/[slug]` | — (крупный блок Teachers = профиль) | ❓ |
| `/results` | Results | ⬜ |
| `/certificate`, `/certificate/[serial]` | Results (блок проверки), Certificate | ⬜ |
| `/about` | «О нас и контакты» | ⬜ |
| `/contacts` | → редирект на `/about` | ⬜ |
| `/news`, `/news/[slug]` | — | ❓ |
| `/signup` | SignUp | ⬜ |
| `/signin`, `/forgot-password`, `/reset-password`, `/resend-verification` | в стиле SignUp | ⬜ |
| `/level-test`, `/level-test/[lesson]` | LevelTest | ⬜ |
| `/trial-lesson` | Lesson (пробный) | ⬜ |
| `/free-mock-test`, `/free-mock-test/[lesson]` | — | ❓ |
| `/l/[campaign]` | Landing | ⬜ |
| `/r/[token]` | Report | ⬜ |

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
| Шаг «Диалог» в уроке | — | ❓ |

## Преподаватель и админка (StaffShell: тёмная рейка)

| Адрес | Артборд | Статус |
|---|---|---|
| `/teacher/groups/[id]` | Teacher | ⬜ |
| остальные `/teacher/*` | в стиле Teacher | ⬜ |
| `/admin` | Admin | ⬜ |
| остальные `/admin/*` (курсы, уроки, студенты, эфиры) | в стиле Admin | ⬜ |
| `/admin/news*` | — | ❓ (вместе с новостями) |

## Только редиректы (оставляем как есть)

`/dashboard` → `/learn`, `/free-lesson` → `/trial-lesson`,
`/courses/[slug]/lessons/[lesson]` → `/learn/...`.
