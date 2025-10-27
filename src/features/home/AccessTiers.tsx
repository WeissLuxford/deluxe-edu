'use client'

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export default function AccessTiers({ base }: { base: string }) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const [visible, setVisible] = useState<boolean[]>([])

  useEffect(() => {
    const tiers = [
      {
        title: "Basic",
        desc: "Access to video lessons and assignments",
        price: "200 000 UZS / month",
        seats: "500 seats"
      },
      {
        title: "Pro",
        desc: "Video lessons, assignments, and personal feedback",
        price: "400 000 UZS / month",
        seats: "200 seats",
        highlight: true
      },
      {
        title: "Deluxe",
        desc: "Individual one-on-one mentoring sessions",
        price: "800 000 UZS / month",
        seats: "50 seats"
      }
    ]

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
  }, [])

  const tiers = [
    {
      title: "Basic",
      desc: "Access to video lessons and assignments",
      price: "200 000 UZS / month",
      seats: "500 seats"
    },
    {
      title: "Pro",
      desc: "Video lessons, assignments, and personal feedback",
      price: "400 000 UZS / month",
      seats: "200 seats",
      highlight: true
    },
    {
      title: "Deluxe",
      desc: "Individual one-on-one mentoring sessions",
      price: "800 000 UZS / month",
      seats: "50 seats"
    }
  ]

  return (
    <section id="block-access" data-section="access-tiers" className="relative py-28">
      <div className="access-bg" />
      <div className="container relative z-10">
        <div className="access-head text-center mb-14">
          <h2 className="text-4xl font-bold text-gradient">Access tiers</h2>
          <p className="text-lg text-muted mt-2">Choose your learning level</p>
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
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg">{tier.title}</div>
                <span className="badge badge-primary">{tier.seats}</span>
              </div>
              <p className="text-base text-muted mb-4">{tier.desc}</p>
              <div className="divider" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gold">{tier.price}</span>
                <Link href={`${base}/signin`} className="iridescent vx">
                  Join
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
