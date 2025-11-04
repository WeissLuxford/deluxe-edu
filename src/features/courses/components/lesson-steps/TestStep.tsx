// src/features/courses/components/lesson-steps/TestStep.tsx
'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

type Assignment = {
  id: string
  title: any
  prompt: any
  answerKey?: any
}

type Props = {
  assignment: Assignment
  lessonId: string
  userId: string
  locale: string
  enrollmentPlan: string
  onComplete: () => void
  isCompleted: boolean
}

type Question = {
  id: string
  type: 'single' | 'multiple' | 'text' | 'code'
  question: string
  options?: string[]
  correctAnswer?: string | string[]
}

function getLocalizedText(value: any, locale: string) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    if (value[locale]) return value[locale]
    const first = Object.values(value)[0]
    return typeof first === 'string' ? first : ''
  }
  return ''
}

export function TestStep({ assignment, lessonId, userId, locale, enrollmentPlan, onComplete, isCompleted }: Props) {
  // Mock questions - replace with real assignment.prompt
  const mockQuestions: Question[] = [
    {
      id: '1',
      type: 'single',
      question: 'What is the correct form of Present Simple?',
      options: ['He go', 'He goes', 'He going', 'He is go'],
      correctAnswer: 'He goes'
    },
    {
      id: '2',
      type: 'multiple',
      question: 'Select all correct pronouns:',
      options: ['I', 'Me', 'My', 'Mine'],
      correctAnswer: ['I', 'Me', 'My', 'Mine']
    },
    {
      id: '3',
      type: 'text',
      question: 'What is the capital of the UK?',
      correctAnswer: 'London'
    }
  ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const totalQuestions = mockQuestions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      submitTest()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const submitTest = async () => {
    // Calculate score
    let correct = 0
    mockQuestions.forEach(q => {
      const userAnswer = answers[q.id]
      if (q.type === 'single' || q.type === 'text') {
        if (userAnswer?.toLowerCase() === String(q.correctAnswer).toLowerCase()) correct++
      } else if (q.type === 'multiple') {
        const correctAnswers = q.correctAnswer as string[]
        if (Array.isArray(userAnswer) && userAnswer.length === correctAnswers.length &&
            userAnswer.every(a => correctAnswers.includes(a))) {
          correct++
        }
      }
    })

    const percentage = (correct / totalQuestions) * 100
    setScore(percentage)
    setShowResults(true)

    // Submit to API
    const passed = percentage >= 70
    await fetch('/api/lessons/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignmentId: assignment.id,
        lessonId,
        userId,
        answer: answers,
        grade: Math.round(percentage)
      })
    })

    if (passed) {
      onComplete()
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setScore(0)
  }

  if (showResults) {
    const passed = score >= 70

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <div className="text-6xl mb-4">
            {passed ? '🎉' : '📚'}
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: passed ? '#22c55e' : 'var(--gold)' }}>
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </h2>
          <p className="text-lg mb-4" style={{ color: 'var(--muted)' }}>
            Your score: <strong style={{ color: 'var(--gold)' }}>{Math.round(score)}%</strong>
          </p>
          <p style={{ color: 'var(--muted)' }}>
            {passed
              ? 'You passed! You can now proceed to the next lesson.'
              : 'You need 70% to pass. Review the material and try again.'}
          </p>
        </div>

        {/* Results Details */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--fg)' }}>Test Results</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--muted)' }}>Correct Answers</span>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>
                {Math.round((score / 100) * totalQuestions)} / {totalQuestions}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--muted)' }}>Passing Score</span>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>70%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {!passed && (
            <button onClick={handleRetry} className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
          
          {(enrollmentPlan === 'PRO' || enrollmentPlan === 'DELUXE') && (
            <button className="btn btn-secondary flex-1" onClick={() => alert('Contact mentor on Telegram')}>
              Ask Mentor
            </button>
          )}
        </div>

        {!passed && (
          <div className="rounded-lg p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="text-sm" style={{ color: '#ef4444' }}>
              💡 Review the video and notes before retrying the test
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% complete
          </span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--fg)' }}>
          {currentQuestion.question}
        </h3>

        {/* Single Choice */}
        {currentQuestion.type === 'single' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
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
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === 'multiple' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = (answers[currentQuestion.id] || []).includes(option)
              return (
                <button
                  key={index}
                  onClick={() => {
                    const current = answers[currentQuestion.id] || []
                    handleAnswer(
                      isSelected
                        ? current.filter((a: string) => a !== option)
                        : [...current, option]
                    )
                  }}
                  className="w-full text-left p-4 rounded-lg transition-all flex items-center gap-3"
                  style={{
                    background: isSelected ? 'rgba(199, 164, 90, 0.2)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                    color: 'var(--fg)'
                  }}
                >
                  <div
                    className="w-5 h-5 rounded border flex items-center justify-center"
                    style={{ borderColor: isSelected ? 'var(--gold)' : 'var(--border)', background: isSelected ? 'var(--gold)' : 'transparent' }}
                  >
                    {isSelected && <CheckCircle size={14} style={{ color: 'var(--bg)' }} />}
                  </div>
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {/* Text Input */}
        {currentQuestion.type === 'text' && (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="input"
            style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        )}

        {/* Code Input */}
        {currentQuestion.type === 'code' && (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Write your code here..."
            className="textarea"
            rows={8}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--fg)',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
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
          className="btn btn-primary flex-1"
          style={{
            background: 'var(--gold)',
            color: 'var(--bg)',
            opacity: answers[currentQuestion.id] ? 1 : 0.5
          }}
        >
          {isLastQuestion ? 'Submit Test' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}