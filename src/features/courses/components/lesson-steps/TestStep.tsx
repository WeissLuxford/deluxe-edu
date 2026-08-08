// src/features/courses/components/lesson-steps/TestStep.tsx
'use client'

import { useState } from 'react'
import { CheckCircle, RefreshCw } from 'lucide-react'

/**
 * Вопросы приходят из Assignment.prompt в базе. Правильных ответов здесь НЕТ
 * и быть не должно — их знает только сервер (Assignment.answerKey), он же
 * и считает оценку.
 *
 * Формат Assignment.prompt:
 * {
 *   "questions": [
 *     { "id": "q1", "type": "single",
 *       "question": { "ru": "...", "en": "...", "uz": "..." },
 *       "options": [ { "value": "a", "label": { "ru": "...", "en": "..." } } ] },
 *     { "id": "q2", "type": "text", "question": { "ru": "..." } }
 *   ]
 * }
 *
 * Формат Assignment.answerKey (только на сервере):
 * { "q1": "a", "q2": "London", "q3": ["a", "c"] }
 */

type LocalizedText = string | Record<string, string>

type Option = {
  value: string
  label: LocalizedText
}

type Question = {
  id: string
  type: 'single' | 'multiple' | 'text' | 'code'
  question: LocalizedText
  options?: Option[]
}

type Assignment = {
  id: string
  title: any
  prompt: any
}

type Props = {
  assignment: Assignment
  locale: string
  enrollmentPlan: string
  onComplete: () => void
  isCompleted: boolean
}

function getLocalizedText(value: LocalizedText | undefined, locale: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value[locale]) return value[locale]
  const first = Object.values(value)[0]
  return typeof first === 'string' ? first : ''
}

function readQuestions(prompt: any): Question[] {
  if (Array.isArray(prompt?.questions)) return prompt.questions
  return []
}

export function TestStep({ assignment, locale, enrollmentPlan, onComplete, isCompleted }: Props) {
  const questions = readQuestions(assignment.prompt)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [result, setResult] = useState<{ grade: number; passed: boolean; passingScore: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Тест ещё не наполнен контентом
  if (questions.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ padding: '3rem' }}>
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--fg)' }}>
          Тест ещё готовится
        </h3>
        <p style={{ color: 'var(--muted)' }}>
          Для этого урока пока не добавлены вопросы.
        </p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
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
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/lessons/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: assignment.id, answers })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data?.error || 'Не удалось отправить тест')
        return
      }

      // Оценку берём с сервера, сами её не считаем
      setResult({ grade: data.grade, passed: data.passed, passingScore: data.passingScore })
      if (data.passed) onComplete()
    } catch {
      setError('Не удалось отправить тест. Проверь соединение.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setResult(null)
    setError(null)
  }

  if (result) {
    const { grade, passed, passingScore } = result

    return (
      <div className="space-y-6">
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <div className="text-6xl mb-4">{passed ? '🎉' : '📚'}</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: passed ? '#22c55e' : 'var(--gold)' }}>
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </h2>
          <p className="text-lg mb-4" style={{ color: 'var(--muted)' }}>
            Your score: <strong style={{ color: 'var(--gold-text)' }}>{grade}%</strong>
          </p>
          <p style={{ color: 'var(--muted)' }}>
            {passed
              ? 'You passed! You can now proceed to the next lesson.'
              : `You need ${passingScore}% to pass. Review the material and try again.`}
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--fg)' }}>Test Results</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--muted)' }}>Correct Answers</span>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>
                {Math.round((grade / 100) * totalQuestions)} / {totalQuestions}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--muted)' }}>Passing Score</span>
              <span style={{ color: 'var(--gold-text)', fontWeight: 600 }}>{passingScore}%</span>
            </div>
          </div>
        </div>

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

  const currentAnswer = answers[currentQuestion.id]
  const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : Boolean(currentAnswer)

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
          {getLocalizedText(currentQuestion.question, locale)}
        </h3>

        {/* Single Choice */}
        {currentQuestion.type === 'single' && (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => {
              const isSelected = currentAnswer === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full text-left p-4 rounded-lg transition-all"
                  style={{
                    background: isSelected ? 'rgba(199, 164, 90, 0.2)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                    color: 'var(--fg)'
                  }}
                >
                  {getLocalizedText(option.label, locale)}
                </button>
              )
            })}
          </div>
        )}

        {/* Multiple Choice */}
        {currentQuestion.type === 'multiple' && (
          <div className="space-y-3">
            {currentQuestion.options?.map(option => {
              const selected: string[] = currentAnswer || []
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleAnswer(
                      isSelected
                        ? selected.filter(v => v !== option.value)
                        : [...selected, option.value]
                    )
                  }
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
                  {getLocalizedText(option.label, locale)}
                </button>
              )
            })}
          </div>
        )}

        {/* Text Input */}
        {currentQuestion.type === 'text' && (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="input"
            style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        )}

        {/* Code Input */}
        {currentQuestion.type === 'code' && (
          <textarea
            value={currentAnswer || ''}
            onChange={e => handleAnswer(e.target.value)}
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

      {error && (
        <div className="rounded-lg p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div className="text-sm" style={{ color: '#ef4444' }}>{error}</div>
        </div>
      )}

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
          disabled={!hasAnswer || submitting}
          className="btn btn-primary flex-1"
          style={{
            background: 'var(--gold)',
            color: 'var(--bg)',
            opacity: hasAnswer && !submitting ? 1 : 0.5
          }}
        >
          {submitting ? 'Sending…' : isLastQuestion ? 'Submit Test' : 'Next Question'}
        </button>
      </div>
    </div>
  )
}
