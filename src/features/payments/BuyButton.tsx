'use client'

import { useState } from 'react'

export default function BuyButton({
  courseSlug,
  locale,
  label,
  provider = 'payme'
}: {
  courseSlug: string
  locale: string
  label: string
  provider?: 'payme' | 'click'
}) {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    try {
      setLoading(true)
      const endpoint =
        provider === 'click'
          ? '/api/payments/click/create'
          : '/api/payments/payme/create'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ courseSlug, locale })
      })
      const data = await res.json()
      if (data?.ok && data?.url) {
        window.location.href = data.url
      } else {
        alert('Payment init failed')
        setLoading(false)
      }
    } catch {
      alert('Network error')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 rounded bg-yellow-400 text-black disabled:opacity-60"
    >
      {loading ? '...' : label}
    </button>
  )
}
