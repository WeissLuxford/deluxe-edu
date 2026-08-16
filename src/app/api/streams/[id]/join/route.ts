import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canWatch, getUserPlanRank, statusOf } from '@/features/streams/utils/streamHelpers'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const stream = await prisma.stream.findFirst({
    where: { id, published: true },
    select: {
      kind: true,
      zoomJoinUrl: true,
      requiredPlan: true,
      startsAt: true,
      durationMin: true
    }
  })

  if (!stream) {
    return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
  }
  if (stream.kind !== 'ZOOM' || !stream.zoomJoinUrl) {
    return NextResponse.json({ error: 'Not a Zoom stream' }, { status: 400 })
  }

  if (stream.requiredPlan) {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rank = await getUserPlanRank(userId)
    if (!canWatch(stream.requiredPlan, rank)) {
      return NextResponse.json({ error: 'Plan required' }, { status: 403 })
    }
  }

  const status = statusOf(stream.startsAt, stream.durationMin)
  if (status === 'past') {
    return NextResponse.json({ error: 'Stream has ended' }, { status: 409 })
  }

  return NextResponse.json({ url: stream.zoomJoinUrl })
}
