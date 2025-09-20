import { NextResponse } from 'next/server'
import { createZoomSignature } from '@/lib/zoom'
export async function POST(req: Request) {
  const { meetingNumber, role } = await req.json()
  const signature = createZoomSignature({
    sdkKey: process.env.ZOOM_SDK_KEY as string,
    sdkSecret: process.env.ZOOM_SDK_SECRET as string,
    meetingNumber,
    role
  })
  return NextResponse.json({ signature })
}
