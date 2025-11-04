import Link from "next/link"

export default function CTASection({ base }: { base: string }) {
  return (
    <section className="relative py-28 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 hero-gradient opacity-40" />
      <div className="container relative">
        <div className="cta-glass mx-auto max-w-3xl text-center p-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gradient">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-muted mb-4">
            Join hundreds of students learning English the affordable way.
          </p>
          <p className="text-lg text-muted mb-10">
            Try your first lesson completely free — no credit card required. See why students choose Deluxe Edu.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`${base}/trial-lesson`} className="iridescent vx">
              Start Free Lesson
            </Link>
            <Link href={`${base}/courses`} className="btn-secondary">
              Browse Courses
            </Link>
          </div>
          <p className="text-sm text-muted mt-8">
            🎉 Special Launch Offer: First 100 students get 20% off Pro & Deluxe plans
          </p>
        </div>
      </div>
    </section>
  )
}