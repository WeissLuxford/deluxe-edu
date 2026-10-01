import raw from '@/content/reviews.json'
import { prisma } from '@/lib/db'

// Стена результатов. Всё, что здесь показывается, должно быть проверяемым:
// отзыв с номером сертификата проверяется на /certificate, счётчик выданных
// сертификатов считается запросом. Придумывать числа мы не будем — с 23 000
// учеников конкурента мы всё равно не сравнимся, а проигрыш на выдуманных
// цифрах хуже, чем отсутствие цифр.

export type Review = {
  name: string
  text: string
  result?: string
  certificateSerial?: string
  videoUrl?: string
}

const ALL = ((raw as { reviews?: Review[] }).reviews ?? []) as Review[]

export function realReviews(): Review[] {
  return ALL.filter(review => review.name.trim().length > 0 && review.text.trim().length > 0)
}

/** Отозванные сертификаты в счётчик не идут. */
export async function issuedCertificateCount(): Promise<number> {
  return prisma.certificate.count({ where: { revokedAt: null } })
}
