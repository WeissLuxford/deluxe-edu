'use client'

import { useTranslations } from 'next-intl'

export default function HowItWorks() {
  const t = useTranslations('home')
  const steps = [
    {
      n: "1",
      title: t('w1'),
      desc: t('w1d')
    },
    {
      n: "2",
      title: t('w2'),
      desc: t('w2d')
    },
    {
      n: "3",
      title: t('w3'),
      desc: t('w3d')
    }
  ]

  return (
    <section id="how-it-works">
      <div>
        <h2>{t('howTitle')}</h2>
        <p>{t('howLead')}</p>
      </div>
      <div>
        {steps.map(s => (
          <article key={s.n}>
            <div>{s.n}</div>
            <div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
