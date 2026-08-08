'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, User, Lock, ArrowRight } from 'lucide-react'

export default function SignUpPage() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const search = useSearchParams()
  
  const validLocale = ['ru', 'uz', 'en'].includes(locale) ? locale : 'ru'
  const next = search.get('next') || `/${validLocale}/dashboard`
  
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone')
  const [phone, setPhone] = useState('+998 ') // ← Дефолтное значение
  const [otp, setOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Форматирование номера телефона
  const formatPhone = (value: string) => {
    // Удаляем всё кроме цифр
    let digits = value.replace(/\D/g, '')
    
    // Если начинается с 998, оставляем
    if (digits.startsWith('998')) {
      digits = digits.slice(3, 12) // Берем только 9 цифр после 998
    } else if (digits.length > 0) {
      // Если юзер начал вводить без 998, используем его цифры
      digits = digits.slice(0, 9)
    }
    
    // Форматируем: +998 XX XXX XX XX
    if (digits.length === 0) return '+998 '
    if (digits.length <= 2) return `+998 ${digits}`
    if (digits.length <= 5) return `+998 ${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Если юзер удаляет и остается меньше "+998 ", сбрасываем на "+998 "
    if (value.length < 5) {
      setPhone('+998 ')
      return
    }
    
    const formatted = formatPhone(value)
    setPhone(formatted)
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Запрещаем удалять "+998 "
    if (e.key === 'Backspace' && phone === '+998 ') {
      e.preventDefault()
    }
  }

  const sendOTP = async () => {
    setLoading(true)
    setError('')
    
    const cleanPhone = phone.replace(/\D/g, '') // 998901234567
    
    if (cleanPhone.length !== 12) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }
      
      if (data.testMode) {
        console.log('⚠️ TEST MODE: Check terminal console for OTP code')
      }
      
      setStep('otp')
      setLoading(false)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    setLoading(true)
    setError('')
    
    const cleanPhone = phone.replace(/\D/g, '')
    
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code: otp })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Invalid OTP')
        setLoading(false)
        return
      }
      
      setStep('details')
      setLoading(false)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    setError('')
    
    const cleanPhone = phone.replace(/\D/g, '')
    
    const result = await signIn('credentials', {
      action: 'signup',
      phone: cleanPhone,
      password,
      firstName,
      lastName,
      redirect: false
    })
    
    setLoading(false)
    
    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? 'Signup failed' : result.error)
      return
    }
    
    if (result?.ok) {
      router.push(next)
      router.refresh()
    }
  }

  const passwordOk = (s: string) => /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(s)
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword
  const weak = password.length > 0 && !passwordOk(password)

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">
          {step === 'phone' && 'Create Account'}
          {step === 'otp' && 'Verify Phone'}
          {step === 'details' && 'Complete Profile'}
        </h1>
        
        {error && (
          <div className="auth-error" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
            {error}
          </div>
        )}

        {/* STEP 1: Phone Number */}
        {step === 'phone' && (
          <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label className="label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={handlePhoneKeyDown}
                  className="input"
                  style={{ paddingLeft: '3rem', fontSize: '1rem', letterSpacing: '0.02em' }}
                  autoFocus
                  required
                />
              </div>
              <p className="auth-hint" style={{ marginTop: '0.5rem' }}>We'll send you a verification code</p>
            </div>

            <button 
              type="submit" 
              className="iridescent vx w-full" 
              disabled={loading || phone.replace(/\D/g, '').length !== 12}
            >
              {loading ? 'Sending...' : 'Send Code'}
              <span className="drop-shadow" />
            </button>

            <p className="auth-note">
              Already have an account?{' '}
              <Link href={`/${validLocale}/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="auth-link">
                Sign In
              </Link>
            </p>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={(e) => { e.preventDefault(); verifyOTP(); }} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label className="label">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                maxLength={6}
                autoFocus
                required
              />
              <p className="auth-hint" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                Code sent to {phone}
              </p>
            </div>

            <button type="submit" className="iridescent vx w-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
              <span className="drop-shadow" />
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="btn-ghost"
              disabled={loading}
            >
              Change Number
            </button>

            <button
              type="button"
              onClick={sendOTP}
              className="auth-link"
              disabled={loading}
            >
              Resend Code
            </button>
          </form>
        )}

        {/* STEP 3: Profile Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="auth-grid2">
              <div>
                <label className="label">First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '3rem' }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Last Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '3rem' }}
                  required
                />
              </div>
              {weak && <p className="auth-hint" style={{ color: '#ef4444', marginTop: '0.5rem' }}>Password must contain letters and numbers (min 6 chars)</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '3rem' }}
                  required
                />
              </div>
              {mismatch && <p className="auth-hint" style={{ color: '#ef4444', marginTop: '0.5rem' }}>Passwords do not match</p>}
            </div>

            <button 
              type="submit" 
              className="iridescent vx w-full" 
              disabled={loading || !firstName || !lastName || !passwordOk(password) || password !== confirmPassword}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <span className="drop-shadow" />
            </button>
          </form>
        )}
      </div>
    </main>
  )
}