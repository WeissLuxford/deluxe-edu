'use client'

import { useState } from "react"

const faqs = [
  {
    q: "How do lessons work",
    a: "You study with short videos, summaries, and practical tasks. Pro and Deluxe include feedback sessions."
  },
  {
    q: "Can I start for free",
    a: "Yes, the first lesson is free. It takes about 10 minutes to see the flow and decide."
  },
  {
    q: "What levels are supported",
    a: "Beginner to upper intermediate. The path adapts to your current level."
  },
  {
    q: "Can I pause or switch a tier",
    a: "Yes, you can switch tiers anytime. Pausing is available at the end of your billing cycle."
  }
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-24">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-gradient">Frequently asked questions</h2>
        <div className="faq-root">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className={`faq-item glass-panel ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="faq-title">{item.q}</span>
                  <span className={`faq-caret ${isOpen ? "rot" : ""}`} aria-hidden>▾</span>
                </button>
                <div className={`faq-answer ${isOpen ? "show" : ""}`}>
                  <p className="text-muted">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
