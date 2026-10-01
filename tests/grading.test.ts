import { describe, expect, it } from 'vitest'
import { gradeAnswers } from '@/features/courses/grading'

describe('gradeAnswers', () => {
  it('returns null for an empty key', () => {
    expect(gradeAnswers({}, { q1: 'a' })).toBeNull()
  })

  it('compares text case- and whitespace-insensitively', () => {
    const result = gradeAnswers({ q1: 'Went' }, { q1: '  went ' })
    expect(result).toEqual({ grade: 100, correct: 1, total: 1, wrongIds: [] })
  })

  it('requires the exact set for multi-choice, in any order', () => {
    expect(gradeAnswers({ q1: ['a', 'b'] }, { q1: ['b', 'a'] })?.correct).toBe(1)
    expect(gradeAnswers({ q1: ['a', 'b'] }, { q1: ['a'] })?.correct).toBe(0)
    expect(gradeAnswers({ q1: ['a', 'b'] }, { q1: ['a', 'b', 'c'] })?.correct).toBe(0)
  })

  it('counts missing and mistyped answers as wrong and rounds the grade', () => {
    const result = gradeAnswers({ q1: 'a', q2: 'b', q3: ['c'] }, { q1: 'a', q3: 'c' })
    expect(result).toEqual({ grade: 33, correct: 1, total: 3, wrongIds: ['q2', 'q3'] })
  })
})
