'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

export default function SignInPage() {
  const t = useTranslations('common')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn('credentials', { email, name, callbackUrl: `/${locale}` })
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border rounded">
        <h1 className="text-xl font-bold">{t('signin.title')}</h1>
        <input
          type="text"
          placeholder={t('signin.email')}
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder={t('signin.name')}
          value={name}
          onChange={e => setName(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          {t('buttons.signIn')}
        </button>
      </form>
    </main>
  )
}
