import Link from "next/link"

export default function CTASection({ base }: { base: string }) {
  return (
    <section className="relative py-28 flex items-center justify-center">
      <div className="absolute inset-0 hero-gradient opacity-60" />
      <div className="container relative">
        <div className="cta-glass mx-auto max-w-2xl text-center p-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 text-gradient">
            Still hesitating?
          </h2>
          <p className="text-lg text-muted mb-10">
            Try your first Vertex lesson for free — it only takes 10 minutes to discover how far you can go.
          </p>
          <Link href={`${base}/signin`} className="iridescent vx">
            Start now
          </Link>
        </div>
      </div>
    </section>
  )
}
