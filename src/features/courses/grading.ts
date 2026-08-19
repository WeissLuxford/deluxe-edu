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
