export function emailSignupEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EMAIL_ENABLED === 'true'
}

export function googleSignInEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true'
}
