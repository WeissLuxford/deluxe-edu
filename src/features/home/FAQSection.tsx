'use client'

import { useState } from "react"

const faqs = [
  {
    q: "How much does it really cost?",
    a: "Basic starts at $15/month (200,000 UZS), Pro is $30/month (400,000 UZS), and Deluxe is $60/month (800,000 UZS). No hidden fees, no upsells."
  },
  {
    q: "Can I try before paying?",
    a: "Absolutely! Take our free trial lesson — it's a full lesson with video, notes, and a test. No credit card needed."
  },
  {
    q: "What levels do you teach?",
    a: "We cover Beginner to Advanced (A1-C1). Our level test will help you find the perfect starting point."
  },
  {
    q: "Do I need a mentor or can I study solo?",
    a: "Both! Basic plan is perfect for self-study with all materials. Pro and Deluxe add mentor support for feedback."
  },
  {
    q: "Are live streams recorded?",
    a: "Yes! All live streams are saved automatically. Watch them anytime if you miss the live session."
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, upgrade or downgrade anytime. Changes take effect at your next billing cycle."
  },
  {
    q: "What makes you different from expensive schools?",
    a: "We're affordable ($15-60/month vs $100-300), fully online, and actually care. No arrogance, just education."
  },
  {
    q: "Is there a money-back guarantee?",
    a: "We offer a 7-day satisfaction guarantee. If you're not happy, get a full refund — no questions asked."
  }
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-24" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gradient">Frequently Asked Questions</h2>
          <p className="text-lg text-muted">Everything you need to know</p>
        </div>
        <div className="faq-root" style={{ maxWidth: '900px', margin: '0 auto' }}>
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
                  <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.7' }}>{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-10">
          <p className="text-muted text-lg mb-4">Still have questions?</p>
          <a href="/contacts" className="btn-secondary">Contact Us</a>
        </div>
      </div>
    </section>
  )
}