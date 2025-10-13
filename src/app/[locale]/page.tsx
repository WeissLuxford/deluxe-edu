import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <main className="relative min-h-[80vh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full blur-3xl opacity-20"
             style={{background: 'radial-gradient(closest-side, #facc15, transparent)'}} />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-20"
             style={{background: 'radial-gradient(closest-side, #fde68a, transparent)'}} />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:22px_22px]" />
      </div>

      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="max-w-xl text-lg opacity-80">
              Deluxe обучение с живыми уроками, понятными объяснениями и заданиями для закрепления.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/courses`} className="px-6 py-3 rounded bg-yellow-400 text-black font-medium">
                {t('nav.courses')}
              </Link>
              <Link href={`/${locale}/signin`} className="px-6 py-3 rounded border font-medium">
                {t('buttons.signIn')}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              <div className="rounded border p-4 text-center">
                <div className="text-2xl font-bold">UX</div>
                <div className="text-xs opacity-70">минимализм</div>
              </div>
              <div className="rounded border p-4 text-center">
                <div className="text-2xl font-bold">Live</div>
                <div className="text-xs opacity-70">уроки</div>
              </div>
              <div className="rounded border p-4 text-center">
                <div className="text-2xl font-bold">Tasks</div>
                <div className="text-xs opacity-70">проверка</div>
              </div>
              <div className="rounded border p-4 text-center">
                <div className="text-2xl font-bold">Multi</div>
                <div className="text-xs opacity-70">языки</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-video w-full rounded-xl border bg-black/60 backdrop-blur flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-semibold">Deluxe</div>
                <div className="opacity-80">видео и векторы скоро тут</div>
              </div>
            </div>
            <div className="absolute -inset-x-6 -inset-y-6 -z-10 bg-gradient-to-tr from-yellow-300/10 via-amber-200/10 to-transparent blur-2xl" />
          </div>
        </div>
      </section>
    </main>
  )
}
