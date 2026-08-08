// При наличии prisma.config.ts Prisma перестаёт подхватывать .env сама —
// загружаем его явно, иначе CLI не видит DATABASE_URL.
import 'dotenv/config'

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
