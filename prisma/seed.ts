import { prisma } from './seed/shared'
import { seedCourses } from './seed/courses'
import { seedFreeZone } from './seed/free'
import { seedCourseContent } from './seed/lessons'
import { seedNews } from './seed/news'
import { seedStreams } from './seed/streams'
import { seedLeads } from './seed/leads'

// Сид только добавляет и обновляет свои записи по slug: ничего чужого он не
// удаляет, поэтому его безопасно запускать поверх базы, где уже работают.
async function main() {
  await seedCourses()
  await seedFreeZone()
  await seedCourseContent()
  await seedNews()
  await seedStreams()
  await seedLeads()

  console.log('готово')
}

main()
  .catch(error => {
    console.error('сид упал:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
