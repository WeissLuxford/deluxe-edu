// src/features/courses/components/FreeTrialPlayer.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Props = {
  lesson: any
  courseTitle: string
  title: string
  content: string
  locale: string
}

export function FreeTrialPlayer({ lesson, courseTitle, title, content, locale }: Props) {
  const [currentStep, setCurrentStep] = useState<'video' | 'conspect'>('video')

  return (
    <div className="page-start py-8">
      <div className="mx-auto max-w-4xl">
        {/* Info Banner */}
        <div className="mb-6 rounded-lg p-4" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold mb-1" style={{ color: '#22c55e' }}>
                🎉 Free Trial Lesson
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                No registration required. Experience our teaching style and see if it's right for you!
              </p>
            </div>
            <Link
              href={`/${locale}/signup`}
              className="btn btn-primary whitespace-nowrap"
              style={{ background: '#22c55e', color: '#fff', fontSize: '0.875rem' }}
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Step Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentStep('video')}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all"
            style={{
              background: currentStep === 'video' ? 'var(--gold)' : 'var(--bg-secondary)',
              color: currentStep === 'video' ? 'var(--bg)' : 'var(--fg)',
              border: `1px solid ${currentStep === 'video' ? 'var(--gold)' : 'var(--border)'}`
            }}
          >
            📹 Video Lesson
          </button>
          <button
            onClick={() => setCurrentStep('conspect')}
            className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all"
            style={{
              background: currentStep === 'conspect' ? 'var(--gold)' : 'var(--bg-secondary)',
              color: currentStep === 'conspect' ? 'var(--bg)' : 'var(--fg)',
              border: `1px solid ${currentStep === 'conspect' ? 'var(--gold)' : 'var(--border)'}`
            }}
          >
            📝 Lesson Notes
          </button>
        </div>

        {/* Video Step */}
        {currentStep === 'video' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Video Player */}
            <div className="aspect-video rounded-xl overflow-hidden" style={{ background: '#000' }}>
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎥</div>
                  <div className="text-lg">Video Player</div>
                  <div className="text-sm opacity-70 mt-2">
                    Integrate your video here (YouTube, Vimeo, or self-hosted)
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg)' }}>
                Welcome to {courseTitle}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                In this lesson, you'll learn the basics of English communication. Watch carefully and take notes!
              </p>
            </div>

            {/* Next Step Button */}
            <button
              onClick={() => setCurrentStep('conspect')}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
              style={{ background: 'var(--gold)', color: 'var(--bg)' }}
            >
              Continue to Notes
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Conspect Step */}
        {currentStep === 'conspect' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Conspect Header */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                📝 Lesson Notes
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                Review the key points from this lesson
              </p>
            </div>

            {/* Conspect Content */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div className="prose prose-invert max-w-none" style={{ color: 'var(--fg)' }}>
                <h3 style={{ color: 'var(--gold)' }}>What You Learned</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                  {content || 'In this free trial lesson, you experienced our teaching methodology. Our courses include:'}
                </p>

                <h3 style={{ color: 'var(--gold)', marginTop: '2rem' }}>Course Features</h3>
                <ul style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                  <li><strong style={{ color: 'var(--fg)' }}>High-quality video lessons</strong> - Professional recordings with clear explanations</li>
                  <li><strong style={{ color: 'var(--fg)' }}>Detailed notes</strong> - Written materials for every lesson</li>
                  <li><strong style={{ color: 'var(--fg)' }}>Interactive tests</strong> - Check your understanding after each lesson</li>
                  <li><strong style={{ color: 'var(--fg)' }}>Progress tracking</strong> - See your improvement over time</li>
                </ul>

                <h3 style={{ color: 'var(--gold)', marginTop: '2rem' }}>What's Next?</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                  Ready to continue learning? Sign up to access full courses with structured lessons, 
                  tests, and certificates. Choose from Beginner to Advanced levels!
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--fg)' }}>
                Ready to Start Your Journey?
              </h3>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>
                Create a free account to take the level test and access courses
              </p>
              
              <div className="flex gap-4 justify-center">
                <Link
                  href={`/${locale}/signup`}
                  className="btn btn-primary"
                  style={{ background: 'var(--gold)', color: 'var(--bg)' }}
                >
                  Create Free Account
                </Link>
                <Link
                  href={`/${locale}/courses`}
                  className="btn btn-secondary"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div className="text-3xl mb-2">🎓</div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>
              Structured Learning
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Step-by-step curriculum
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>
              Learn at Your Pace
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Lifetime access to materials
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div className="text-3xl mb-2">👨‍🏫</div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>
              Expert Support
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              PRO plans include mentorship
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}