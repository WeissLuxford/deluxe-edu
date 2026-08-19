'use client'

import { useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SCRIPT_ID = 'cf-turnstile-script'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
    onTurnstileReady?: () => void
  }
}

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('turnstile script failed')))
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('turnstile script failed'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

type TurnstileProps = {
  onToken: (token: string | null) => void
}

export function turnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}

export default function Turnstile({ onToken }: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const holder = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const callback = useRef(onToken)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    callback.current = onToken
  }, [onToken])

  useEffect(() => {
    if (!siteKey) return

    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !holder.current || !window.turnstile) return
        widgetId.current = window.turnstile.render(holder.current, {
          sitekey: siteKey,
          callback: (token: string) => callback.current(token),
          'expired-callback': () => callback.current(null),
          'error-callback': () => callback.current(null),
          theme: 'auto'
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [siteKey])

  if (!siteKey || failed) return null

  return <div ref={holder} style={{ display: 'flex', justifyContent: 'center' }} />
}
