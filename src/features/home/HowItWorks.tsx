import Link from "next/link"

export default function HowItWorks({ base = "" }: { base?: string }) {
  const steps = [
    {
      n: "1",
      title: "Create your account",
      desc: "Sign in and pick a tier that fits your pace"
    },
    {
      n: "2",
      title: "Take the first lesson",
      desc: "Watch a short video, read the summary, complete a task"
    },
    {
      n: "3",
      title: "Get feedback",
      desc: "See what to improve and move to the next step"
    }
  ]

  return (
    <section id="how-it-works" className="relative py-20">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gradient">How it works</h2>
          <p className="text-muted mt-2">Start in 10 minutes</p>
        </div>
        <div className="events-grid">
          {steps.map(s => (
            <article key={s.n} className="glass-panel p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full grid place-items-center text-sm font-bold text-[var(--bg)] bg-[var(--gold)]">{s.n}</div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted">{s.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href={`${base}/signin`} className="iridescent vx">Start now</Link>
        </div>
      </div>
    </section>
  )
}
