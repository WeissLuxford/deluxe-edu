const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: 'deluxe-start' },
    update: {},
    create: {
      slug: 'deluxe-start',
      title: { ru: 'Deluxe старт', en: 'Deluxe Start', uz: 'Deluxe start' },
      description: { ru: 'Базовый курс', en: 'Base course', uz: 'Bazaviy kurs' },
      priceCents: 990000,
      published: true
    }
  })

  await prisma.lesson.create({
    data: {
      courseId: course.id,
      slug: 'lesson-1',
      title: { ru: 'Урок 1', en: 'Lesson 1', uz: '1-dars' },
      content: { blocks: [] },
      order: 1
    }
  })
}

main()
  .then(() => console.log('seed ok'))
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
