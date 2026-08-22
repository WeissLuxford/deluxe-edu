import { localized } from '@/lib/localized'
import { isAnswerAcceptable, aiConfigured } from '@/lib/ai'

export type Graded = {
  grade: number
  correct: number
  total: number
  wrongIds: string[]
}

// Проверка ответов живёт на сервере, а ключ остаётся в базе: страница теста
// не должна знать правильные ответы, иначе их видно в исходнике.
export function gradeAnswers(
  answerKey: Record<string, unknown>,
  answers: Record<string, unknown>
): Graded | null {
  const questionIds = Object.keys(answerKey)
  if (questionIds.length === 0) return null

  let correct = 0
  const wrongIds: string[] = []

  for (const id of questionIds) {
    const expected = answerKey[id]
    const given = answers?.[id]
    let ok = false

    if (Array.isArray(expected)) {
      ok =
        Array.isArray(given) &&
        given.length === expected.length &&
        given.every(a => expected.includes(a))
    } else if (typeof expected === 'string' && typeof given === 'string') {
      ok = given.trim().toLowerCase() === expected.trim().toLowerCase()
    }

    if (ok) correct++
    else wrongIds.push(id)
  }

  return {
    grade: Math.round((correct / questionIds.length) * 100),
    correct,
    total: questionIds.length,
    wrongIds
  }
}

type PromptQuestion = { id: string; type: string; question: unknown }

function readPromptQuestions(prompt: unknown): PromptQuestion[] {
  const parsed = prompt as { questions?: unknown }
  return Array.isArray(parsed?.questions) ? (parsed.questions as PromptQuestion[]) : []
}

// Точное совпадение (gradeAnswers) уже отработало — здесь только текстовые
// вопросы, провалившие его, получают вторую, мягкую попытку через ИИ
// (опечатки/синонимы). Без ANTHROPIC_API_KEY просто возвращает исходный
// результат — это не обязательная часть проверки, а необязательное
// улучшение поверх неё.
export async function applyLenientTextGrading(
  graded: Graded,
  prompt: unknown,
  answerKey: Record<string, unknown>,
  answers: Record<string, unknown>
): Promise<Graded> {
  if (!aiConfigured() || graded.wrongIds.length === 0) return graded

  const questions = new Map(readPromptQuestions(prompt).map(q => [q.id, q]))
  const upgraded: string[] = []

  for (const id of graded.wrongIds) {
    const question = questions.get(id)
    if (!question || question.type !== 'text') continue

    const expected = answerKey[id]
    const given = answers?.[id]
    if (typeof expected !== 'string' || typeof given !== 'string' || !given.trim()) continue

    const acceptable = await isAnswerAcceptable(localized(question.question, 'ru'), expected, given)
    if (acceptable) upgraded.push(id)
  }

  if (upgraded.length === 0) return graded

  const wrongIds = graded.wrongIds.filter(id => !upgraded.includes(id))
  const correct = graded.correct + upgraded.length

  return { ...graded, correct, wrongIds, grade: Math.round((correct / graded.total) * 100) }
}
