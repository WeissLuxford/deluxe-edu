import crypto from 'crypto'
export function createZoomSignature({ sdkKey, sdkSecret, meetingNumber, role, exp = 120 }) {
  const iat = Math.floor(Date.now() / 1000) - 30
  const tokenExp = iat + exp
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ sdkKey, mn: meetingNumber, role, iat, exp: tokenExp, appKey: sdkKey, tokenExp })).toString('base64url')
  const sig = crypto.createHmac('sha256', sdkSecret).update(`${header}.${payload}`).digest('base64')
  const signature = Buffer.from(sig).toString('base64url')
  return `${header}.${payload}.${signature}`
}
