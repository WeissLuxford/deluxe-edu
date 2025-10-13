'use client'
import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/ru/signin' })}
      className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
    >
      Выйти
    </button>
  )
}
