import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Начиная с Prisma 7 секция "prisma" в package.json больше не работает.
// Настройки переехали сюда.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts'
  }
})
