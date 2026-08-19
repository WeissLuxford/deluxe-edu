const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  if (typeof token !== 'string' || token.length === 0) return false

  const body = new URLSearchParams({ secret, response: token })
  if (ip && ip !== 'unknown') body.set('remoteip', ip)

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })

    if (!res.ok) return false

    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
