// src/features/courses/components/FreeLevelTestPlayer.tsx
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

// Mock questions
const mockQuestions = [
  {
    id: '1',
    type: 'single' as const,
    question: 'Choose the correct form: She ___ to school every day.',
    options: ['go', 'goes', 'going', 'is going'],
    correctAnswer: 'goes'
  },
  {
    id: '2',
    type: 'single' as const,
    question: 'What is the past form of "write"?',
    options: ['writed', 'wrote', 'written', 'writing'],
    correctAnswer: 'wrote'
  },
  {
    id: '3',
    type: 'single' as const,
    question: 'Choose the correct article: I saw ___ elephant.',
    options: ['a', 'an', 'the', '-'],
    correctAnswer: 'an'
  }
]

export function FreeLevelTestPlayer({ lesson, assignment, nextLesson, locale, totalLessons, currentIndex }: Props) {
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

  if (sectionComplete) {
    const score = calculateScore()
    const isLastSection = !nextLesson

    return (
      <div className="page-start py-8">
        <div className="mx-auto max-w-2xl">
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
              Section Complete!
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--muted)' }}>
              Your score: <strong style={{ color: 'var(--gold)' }}>{score}%</strong>
            </p>

            {isLastSection ? (
              <>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  You've completed all sections of the level test!
                </p>
                <div className="glass-panel mb-6" style={{ padding: '1.5rem' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--fg)' }}>
                    Your Recommended Level
                  </h3>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--gold)' }}>
                    {score >= 80 ? 'Upper-Intermediate' : score >= 60 ? 'Intermediate' : score >= 40 ? 'Pre-Intermediate' : 'Elementary'}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Based on your test results
                  </p>
                </div>

                <Link
                  href={`/${locale}/courses`}
                  className="btn btn-primary"
                  style={{ background: 'var(--gold)', color: 'var(--bg)' }}
                >
                  Browse Courses
                </Link>
              </>
            ) : (
              <>
                <p className="mb-6" style={{ color: 'var(--muted)' }}>
                  Continue to the next section
                </p>
                <Link
                  href={`/${locale}/level-test/${nextLesson.slug}`}
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
            💡 Answer all questions in this section. There's no time limit!
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