import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const [phone, password, firstName = 'Admin', lastName = 'Highgate'] = process.argv.slice(2)

  if (!phone || !password) {
    console.error('Использование: npx tsx scripts/create-admin.ts <телефон> <пароль> [имя] [фамилия]')
    console.error('Пример:        npx tsx scripts/create-admin.ts 998901234567 "MyPass123"')
    process.exit(1)
  }

  if (!/^998\d{9}$/.test(phone)) {
    console.error('❌ Телефон должен быть в формате 998XXXXXXXXX (12 цифр, без плюса)')
    process.exit(1)
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
    console.error('❌ Пароль: минимум 6 символов, хотя бы одна буква и одна цифра')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { phone },
    update: { role: 'ADMIN', passwordHash, phoneVerified: new Date() },
    create: {
      phone,
      passwordHash,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: 'ADMIN',
      locale: 'ru',
      phoneVerified: new Date()
    },
    select: { id: true, phone: true, role: true, name: true }
  })

  console.log('✅ Администратор готов:', user.name, `(${user.phone})`)
  console.log('   Вход: /ru/signin, дальше /ru/admin')
}

main()
  .catch(e => {
    console.error('❌', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
