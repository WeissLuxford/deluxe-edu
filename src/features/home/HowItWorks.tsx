import Link from "next/link"

export default function HowItWorks({ base = "" }: { base?: string }) {
  const steps = [
    {
      n: "1",
      title: "Create your account",
      desc: "Sign up for free and choose your learning path — with or without a mentor"
    },
    {
      n: "2",
      title: "Start learning",
      desc: "Watch video lessons, read notes, complete tests. All materials are available 24/7"
    },
    {
      n: "3",
      title: "Join live streams",
      desc: "Ask questions, practice speaking, and connect with other students in real-time"
    }
  ]

  return (
    <section id="how-it-works" className="relative py-20">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gradient mb-3">How it works</h2>
          <p className="text-muted text-lg">Start learning in under 10 minutes</p>
        </div>
        <div className="events-grid">
          {steps.map(s => (
            <article key={s.n} className="glass-panel p-6 flex flex-col gap-4 hover:border-[var(--border-hover)] transition-all duration-300">
              <div 
                className="w-12 h-12 rounded-full grid place-items-center text-lg font-bold text-[var(--bg)] bg-[var(--gold)]"
                style={{ boxShadow: '0 4px 12px rgba(199,164,90,0.3)' }}
              >
                {s.n}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--fg)' }}>{s.title}</h3>
                <p className="text-base text-muted leading-relaxed">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href={`${base}/trial-lesson`} className="iridescent vx">Try Free Lesson</Link>
        </div>
      </div>
    </section>
  )
}