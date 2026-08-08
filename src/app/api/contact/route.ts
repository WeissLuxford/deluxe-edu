import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^998\d{9}$/, 'Expected format: 998901234567'),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal(''))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { firstName, lastName, phone, email, message } = parsed.data

    await prisma.contactRequest.create({
      data: {
        firstName,
        lastName,
        phone,
        email: email || null,
        message: message || null
      }
    })

    return NextResponse.json({ success: true, message: 'Contact request received' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to process contact request' }, { status: 500 })
  }
}
