// src/features/courses/components/SpecialOffersSection.tsx
'use client'

import Link from 'next/link'

type Course = {
  id: string
  slug: string
  title: any
  description: any
  lessons: any[]
} | undefined

type Props = {
  levelTestCourse: Course
  freeMockTest: Course
  paidMockTest: Course
  locale: string
}

export function SpecialOffersSection({ levelTestCourse, freeMockTest, paidMockTest, locale }: Props) {
  return (
    <section className="mb-12">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
          Try Before You Commit
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Start with a free lesson or test your skills
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Free Trial Lesson */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="badge badge-success mb-3">FREE</div>
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>
            Free Trial Lesson
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
            Experience our teaching style with a full lesson
          </p>
          <div className="space-y-1 mb-4 text-xs" style={{ color: 'var(--muted)' }}>
            <div>📹 Video lesson</div>
            <div>📝 Notes included</div>
            <div>⏱️ 20 minutes</div>
          </div>
          <Link
            href={`/${locale}/trial-lesson`}
            className="btn btn-secondary w-full"
            style={{ fontSize: '0.875rem' }}
          >
            Start Free
          </Link>
        </div>

        {/* 2. Level Test */}
        {levelTestCourse && (
          <div className="glass-panel" style={{ padding: '1.5rem', borderColor: '#22c55e' }}>
            <div className="text-3xl mb-3">📊</div>
            <div className="badge badge-success mb-2">RECOMMENDED</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>
              Level Test
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
              Find your English level in 15 minutes
            </p>
            <div className="space-y-1 mb-4 text-xs" style={{ color: 'var(--muted)' }}>
              <div>✅ Instant results</div>
              <div>📈 Detailed report</div>
              <div>🎯 Course recommendations</div>
            </div>
            <Link
              href={`/${locale}/level-test`}
              className="btn btn-primary w-full"
              style={{ background: '#22c55e', color: '#fff', fontSize: '0.875rem' }}
            >
              Take Test
            </Link>
          </div>
        )}

        {/* 3. Free Mock Test */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="badge badge-success mb-3">FREE</div>
          <div className="text-3xl mb-3">📝</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>
            Free Mock Test
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
            IELTS/TOEFL practice with auto-grading
          </p>
          <div className="space-y-1 mb-4 text-xs" style={{ color: 'var(--muted)' }}>
            <div>🤖 Auto-checked</div>
            <div>⏱️ 60 minutes</div>
            <div>📊 Score report</div>
          </div>
          <Link
            href={`/${locale}/free-mock-test`}
            className="btn btn-secondary w-full"
            style={{ fontSize: '0.875rem' }}
          >
            Start Test
          </Link>
        </div>

        {/* 4. Paid Mock Test with Teacher */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--gold)' }}>
          <div className="text-3xl mb-3">👨‍🏫</div>
          <div className="badge badge-primary mb-2">PREMIUM</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>
            Mock Test + Teacher
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
            Professional evaluation & feedback
          </p>
          <div className="space-y-1 mb-4 text-xs" style={{ color: 'var(--muted)' }}>
            <div>👨‍🏫 Teacher review</div>
            <div>📝 Written feedback</div>
            <div>📞 Consultation</div>
          </div>
          <button
            onClick={() => alert('Contact us:\nPhone: +998 90 123 45 67\nTelegram: @deluxeedu')}
            className="iridescent w-full"
            style={{ fontSize: '0.875rem', height: '2.25rem' }}
          >
            Book Now
          </button>
        </div>
      </div>
    </section>
  )
}