import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { firstName, lastName, email } = await request.json()

    // Валидация
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Проверяем уникальность email если он указан
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: session.user.id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Обновляем профиль
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email ? email.toLowerCase().trim() : null
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phoneVerified: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get profile' },
      { status: 500 }
    )
  }
}