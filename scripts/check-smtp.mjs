// Диагностика SMTP: проверяет, что заданных в .env настроек хватает для отправки.
// Запуск:  node scripts/check-smtp.mjs            — только проверка соединения
//          node scripts/check-smtp.mjs you@mail.ru — плюс тестовое письмо на адрес
import 'dotenv/config'
import nodemailer from 'nodemailer'

const mask = value => (value ? `${'*'.repeat(Math.min(value.length, 12))} (len=${value.length})` : '<ПУСТО>')

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT || 587)
const secure = process.env.SMTP_SECURE === 'true'
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.EMAIL_FROM

console.log('SMTP_HOST  :', host || '<ПУСТО>')
console.log('SMTP_PORT  :', port)
console.log('SMTP_SECURE:', secure)
console.log('SMTP_USER  :', user || '<ПУСТО>')
console.log('SMTP_PASS  :', mask(pass))
console.log('EMAIL_FROM :', from || '<ПУСТО>')
console.log('')

if (!host) {
  console.error('SMTP_HOST пуст — mailerConfigured() вернёт false, письма отправляться не будут.')
  process.exit(1)
}

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined
})

try {
  await transport.verify()
  console.log('Соединение и авторизация: OK')
} catch (error) {
  console.error('Соединение НЕ прошло:', error.message)
  process.exit(1)
}

const to = process.argv[2]
if (!to) {
  console.log('Адрес не передан — тестовое письмо не отправлялось.')
  process.exit(0)
}

try {
  const info = await transport.sendMail({
    to,
    from: from || 'no-reply@highgate.uz',
    subject: 'Highgate — проверка SMTP',
    html: '<p>Если вы видите это письмо, отправка через SMTP работает.</p>'
  })
  console.log(`Письмо отправлено на ${to}. messageId: ${info.messageId}`)
  if (info.rejected?.length) console.log('Отклонены:', info.rejected)
} catch (error) {
  console.error('Отправка не удалась:', error.message)
  process.exit(1)
}
