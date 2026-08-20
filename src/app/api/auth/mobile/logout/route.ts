import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/apiAuth'
import { revokeDevice } from '@/lib/devices'

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (auth.ok === false) return auth.response

  if (auth.principal.deviceId) {
    await revokeDevice(auth.principal.deviceId)
  }

  return NextResponse.json({ success: true })
}
