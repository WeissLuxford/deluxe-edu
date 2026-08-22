import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

function getClient(): Anthropic | null {
  if (!aiConfigured()) return null
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return client
}

// Точное совпадение уже проверено и не прошло — сюда попадают только
// текстовые ответы, которые отличаются опечаткой, регистром, лишним
// пробелом или синонимичной формулировкой. Самая дешёвая модель, ответ в
// одно слово — доли цента за проверку. Любая ошибка или отсутствие ключа
// молча возвращает false: строгая проверка уже отработала и её результат
// не должен ломаться из-за недоступного внешнего сервиса.
export async function isAnswerAcceptable(question: string, correct: string, given: string): Promise<boolean> {
  const anthropic = getClient()
  if (!anthropic) return false

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
      system:
        'You grade one short English-language exercise answer. Reply with exactly one word: YES if the student answer is an acceptable equivalent of the correct answer for the given question (allowing minor typos, capitalization, spacing, or a synonymous phrasing), or NO if it is wrong. Never explain, never add punctuation.',
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\nCorrect answer: ${correct}\nStudent answer: ${given}`
        }
      ]
    })

    const block = response.content.find(b => b.type === 'text')
    const answer = block && block.type === 'text' ? block.text.trim().toUpperCase() : ''
    return answer.startsWith('YES')
  } catch (error) {
    console.error('[ai] grading check failed:', error)
    return false
  }
}
