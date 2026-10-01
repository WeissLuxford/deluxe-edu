import { localized } from '@/lib/localized'

export type QuestionType = 'single' | 'multiple' | 'text'

export type QuizQuestion = {
  id: string
  type: QuestionType
  text: string
  options: { value: string; label: string }[]
}

export type Answer = string | string[]
export type Answers = Record<string, Answer>

type RawQuestion = {
  id?: unknown
  type?: unknown
  question?: unknown
  options?: { value?: unknown; label?: unknown }[]
}

/** Reads an Assignment.prompt into display-ready questions. The answer key never leaves the server. */
export function readQuestions(prompt: unknown, locale: string): QuizQuestion[] {
  const list = (prompt as { questions?: unknown })?.questions
  if (!Array.isArray(list)) return []
  return (list as RawQuestion[])
    .filter(q => typeof q?.id === 'string')
    .map(q => ({
      id: q.id as string,
      type: (['single', 'multiple', 'text'].includes(String(q.type)) ? q.type : 'single') as QuestionType,
      text: localized(q.question, locale),
      options: Array.isArray(q.options) ? q.options.map(o => ({ value: String(o.value), label: localized(o.label, locale) })) : []
    }))
}

export function isAnswered(answer: Answer | undefined): boolean {
  if (Array.isArray(answer)) return answer.length > 0
  return typeof answer === 'string' && answer.trim().length > 0
}
