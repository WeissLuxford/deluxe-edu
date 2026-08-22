import nodemailer from 'nodemailer'

type Transport = ReturnType<typeof nodemailer.createTransport>

let transport: Transport | null = null

export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST)
}

function getTransport(): Transport | null {
  if (!mailerConfigured()) return null
  if (transport) return transport

  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    // Регистрация ждёт отправки внутри запроса, поэтому сбой SMTP должен
    // проваливаться быстро: пользователь увидит «не доставлено» и кнопку
    // повтора вместо тридцати секунд на месте.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000
  })

  return transport
}

type SendResult = { delivered: boolean; error?: string }

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  const mailer = getTransport()
  if (!mailer) return { delivered: false, error: 'not_configured' }

  try {
    await mailer.sendMail({
      to,
      from: process.env.EMAIL_FROM || 'no-reply@vertexedu.uz',
      subject,
      html
    })
    return { delivered: true }
  } catch (error) {
    console.error('[mailer] sendMail failed:', error)
    return { delivered: false, error: error instanceof Error ? error.message : String(error) }
  }
}

const COPY = {
  ru: {
    verifySubject: 'Подтверждение почты — Vertex',
    verifyBody: 'Подтвердите адрес электронной почты',
    verifyAction: 'Подтвердить почту',
    resetSubject: 'Восстановление пароля — Vertex',
    resetBody: 'Вы запросили восстановление пароля',
    resetAction: 'Задать новый пароль',
    ignore: 'Если вы этого не запрашивали, просто проигнорируйте письмо'
  },
  uz: {
    verifySubject: 'Emailni tasdiqlash — Vertex',
    verifyBody: 'Elektron pochta manzilingizni tasdiqlang',
    verifyAction: 'Emailni tasdiqlash',
    resetSubject: 'Parolni tiklash — Vertex',
    resetBody: 'Siz parolni tiklashni soʻradingiz',
    resetAction: 'Yangi parol oʻrnatish',
    ignore: 'Agar bu siz boʻlmasangiz, xatni eʼtiborsiz qoldiring'
  },
  en: {
    verifySubject: 'Verify your email — Vertex',
    verifyBody: 'Please confirm your email address',
    verifyAction: 'Verify email',
    resetSubject: 'Reset your password — Vertex',
    resetBody: 'You requested a password reset',
    resetAction: 'Set a new password',
    ignore: 'If you did not request this, simply ignore this email'
  }
} as const

type Locale = keyof typeof COPY

function pick(locale: string): (typeof COPY)[Locale] {
  return COPY[(locale as Locale) in COPY ? (locale as Locale) : 'ru']
}

function layout(body: string, action: string, url: string, ignore: string): string {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6">
<p>${body}</p>
<p><a href="${url}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#c7a45a;color:#0b0d12;text-decoration:none;font-weight:600">${action}</a></p>
${ignore ? `<p style="color:#6b7280;font-size:14px">${ignore}</p>` : ''}
</div>`
}

export async function sendVerificationEmail(to: string, url: string, locale: string): Promise<SendResult> {
  const copy = pick(locale)
  return send(to, copy.verifySubject, layout(copy.verifyBody, copy.verifyAction, url, copy.ignore))
}

export async function sendPasswordResetEmail(to: string, url: string, locale: string): Promise<SendResult> {
  const copy = pick(locale)
  return send(to, copy.resetSubject, layout(copy.resetBody, copy.resetAction, url, copy.ignore))
}
