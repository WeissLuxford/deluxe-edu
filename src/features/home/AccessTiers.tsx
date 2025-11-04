'use client'

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export default function AccessTiers({ base }: { base: string }) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [visible, setVisible] = useState<boolean[]>([])

  const tiers = [
    {
      title: "Basic",
      desc: "Perfect for self-learners who want structured materials",
      features: ["Video lessons", "Downloadable notes", "Interactive tests", "Auto-grading"],
      price: "200,000 UZS",
      priceUSD: "~$15",
      seats: "Unlimited"
    },
    {
      title: "Pro",
      desc: "Get personalized feedback from experienced mentors",
      features: ["Everything in Basic", "Mentor feedback", "Speaking practice", "Weekly Q&A sessions"],
      price: "400,000 UZS",
      priceUSD: "~$30",
      seats: "Limited",
      highlight: true
    },
    {
      title: "Deluxe",
      desc: "Premium 1-on-1 mentoring for maximum results",
      features: ["Everything in Pro", "Individual lessons", "Personalized study plan", "Priority support"],
      price: "800,000 UZS",
      priceUSD: "~$60",
      seats: "Very Limited"
    }
  ]

  useEffect(() => {
    setVisible(new Array(tiers.length).fill(false))

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setVisible(v => {
              const next = [...v]
              next[index] = true
              return next
            })
          }
        })
      },
      { threshold: 0.3 }
    )

    cardsRef.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [tiers.length])

  return (
    <section id="block-access" data-section="access-tiers" className="relative py-28">
      <div className="access-bg" />
      <div className="container relative z-10">
        <div className="access-head text-center mb-14">
          <h2 className="text-4xl font-bold text-gradient mb-3">Choose Your Plan</h2>
          <p className="text-lg text-muted">Affordable English learning for everyone</p>
        </div>

        <div className="access-grid">
          {tiers.map((tier, i) => (
            <div
              key={i}
              ref={el => { cardsRef.current[i] = el }}
              data-index={i}
              className={`vx-tier glass-tier transition-all duration-700 ease-out transform opacity-0 translate-y-8 ${
                visible[i] ? 'opacity-100 translate-y-0' : ''
              } ${tier.highlight ? 'highlight' : ''}`}
              style={{ padding: '2.5rem' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-2xl" style={{ color: 'var(--fg)' }}>{tier.title}</div>
                <span className={`badge ${tier.highlight ? 'badge-success' : 'badge-primary'}`} style={{ padding: '0.5rem 1rem' }}>
                  {tier.seats}
                </span>
              </div>
              
              <p className="text-base text-muted mb-6 leading-relaxed">{tier.desc}</p>
              
              <div className="mb-6">
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--gold)' }}>{tier.price}</div>
                <div className="text-sm text-muted">{tier.priceUSD} / month</div>
              </div>

              <div className="divider mb-6" />

              <ul style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
                {tier.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '1.2rem', lineHeight: '1' }}>✓</span>
                    <span style={{ color: 'var(--fg)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={`${base}/courses`} 
                className={tier.highlight ? 'iridescent vx' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted text-lg mb-4">
            Not sure which plan is right for you?
          </p>
          <Link href={`${base}/trial-lesson`} className="btn-secondary">
            Try Free Lesson First
          </Link>
        </div>
      </div>
    </section>
  )
}