import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createZoomSignature, type ZoomRole } from '@/lib/zoom'

export async function POST(req: Request) {
  const sdkKey = process.env.ZOOM_SDK_KEY
  const sdkSecret = process.env.ZOOM_SDK_SECRET
  if (!sdkKey || !sdkSecret) {
    return NextResponse.json({ error: 'Zoom is not configured' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { meetingNumber } = await req.json()
  if (!meetingNumber || typeof meetingNumber !== 'string') {
    return NextResponse.json({ error: 'Missing meetingNumber' }, { status: 400 })
  }

  const lesson = await prisma.lesson.findFirst({
    where: { zoomMeetingId: meetingNumber },
    select: { courseId: true }
  })
  if (!lesson) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
  }

  const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MENTOR'

  if (!isStaff) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: session.user.id, courseId: lesson.courseId, status: 'ACTIVE' }
    })
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }
  }

  const role: ZoomRole = isStaff ? 1 : 0

  const signature = createZoomSignature({ sdkKey, sdkSecret, meetingNumber, role })
  return NextResponse.json({ signature, sdkKey, role })
}
