// src/features/courses/components/FreeMockTestPlayer.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

type Props = {
  lesson: any
  assignment: any
  nextLesson: any
  locale: string
  totalLessons: number
  currentIndex: number
}

// Mock IELTS/TOEFL questions
const mockQuestions = [
  {
    id: '1',
    type: 'single' as const,
    question: 'Reading: The passage suggests that climate change is primarily caused by:',
    options: [
      'Natural weather patterns',
      'Human industrial activity',
      'Solar radiation changes',
      'Volcanic eruptions'
    ],
    correctAnswer: 'Human industrial activity'
  },
  {
    id: '2',
    type: 'single' as const,
    question: 'Listening: What time does the library close on weekends?',
    options: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
    correctAnswer: '6:00 PM'
  },
  {
    id: '3',
    type: 'single' as const,
    question: 'Grammar: Choose the correct form: If I ___ more time, I would travel around the world.',
    options: ['have', 'had', 'would have', 'will have'],
    correctAnswer: 'had'
  },
  {
    id: '4',
    type: 'single' as const,
    question: 'Vocabulary: What is the meaning of "procrastinate"?',
    options: [
      'To delay or postpone',
      'To work efficiently',
      'To organize tasks',
      'To complete quickly'
    ],
    correctAnswer: 'To delay or postpone'
  }
]

export function FreeMockTestPlayer({ lesson, assignment, nextLesson, locale, totalLessons, currentIndex }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [sectionComplete, setSectionComplete] = useState(false)

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === mockQuestions.length - 1

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setSectionComplete(true)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    mockQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++
    })
    return Math.round((correct / mockQuestions.length) * 100)
  }

  const getBandScore = (percentage: number) => {
    if (percentage >= 90) return '8.0-9.0'
    if (percentage >= 80) return '7.0-7.5'
    if (percentage >= 70) return '6.0-6.5'
    if (percentage >= 60) return '5.0-5.5'
    return '4.0-4.5'
  }

  if (sectionComplete) {
    const score = calculateScore()
    const bandScore = getBandScore(score)
    const isLastSection = !nextLesson

    return (
      <div className="page-start py-8">
        <div className="mx-auto max-w-2xl">
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
              Section Complete!
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--muted)' }}>
              Your score: <strong style={{ color: 'var(--gold)' }}>{score}%</strong>
            </p>

            {isLastSection ? (
              <>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  You've completed the Free Mock Test!
                </p>
                <div className="glass-panel mb-6" style={{ padding: '1.5rem' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--fg)' }}>
                    Estimated IELTS Band Score
                  </h3>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
                    {bandScore}
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                    Based on your test results
                  </p>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    💡 For detailed feedback and personalized improvement plan, try our Premium Mock Test with Teacher Review
                  </div>
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    href={`/${locale}/courses`}
                    className="btn btn-secondary"
                  >
                    Browse Courses
                  </Link>
                  <button
                    onClick={() => alert('Contact us:\nPhone: +998 90 123 45 67\nTelegram: @deluxeedu')}
                    className="btn btn-primary"
                    style={{ background: 'var(--gold)', color: 'var(--bg)' }}
                  >
                    Book Premium Test
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  Continue to the next section
                </p>
                <Link
                  href={`/${locale}/free-mock-test/${nextLesson.slug}`}
                  className="btn btn-primary flex items-center justify-center gap-2 mx-auto"
                  style={{ background: 'var(--gold)', color: 'var(--bg)' }}
                >
                  Next Section
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-start py-8">
      <div className="mx-auto max-w-3xl">
        {/* Info Banner */}
        <div className="mb-6 rounded-lg p-4" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>
            🤖 Auto-graded Mock Test • Answer all questions • No time limit for free version
          </div>
        </div>

        {/* Question Progress */}
        <div className="glass-panel mb-6" style={{ padding: '1rem' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </span>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {Math.round(((currentQuestionIndex + 1) / mockQuestions.length) * 100)}%
            </span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / mockQuestions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--fg)' }}>
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full text-left p-4 rounded-lg transition-all"
                style={{
                  background: answers[currentQuestion.id] === option ? 'rgba(199, 164, 90, 0.2)' : 'var(--bg-tertiary)',
                  border: `1px solid ${answers[currentQuestion.id] === option ? 'var(--gold)' : 'var(--border)'}`,
                  color: 'var(--fg)'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary"
            style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
              opacity: answers[currentQuestion.id] ? 1 : 0.5
            }}
          >
            {isLastQuestion ? 'Complete Section' : 'Next Question'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}