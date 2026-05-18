import { NextRequest, NextResponse } from 'next/server'
import { distributeLead } from '@/lib/lead-distribution'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { serviceId, phone, email, name, idempotencyKey } = await req.json()

    if (!serviceId || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, phone' },
        { status: 400 }
      )
    }

    // Check idempotency
    if (idempotencyKey) {
      const existing = await prisma.webhookIdempotencyKey.findUnique({
        where: { idempotency_key: idempotencyKey },
      })
      if (existing) {
        return NextResponse.json(
          { message: 'Request already processed', cached: true },
          { status: 200 }
        )
      }
    }

    const result = await distributeLead(serviceId, phone, email, name)

    // Store idempotency key
    if (idempotencyKey) {
      await prisma.webhookIdempotencyKey.create({
        data: { idempotency_key: idempotencyKey },
      })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error distributing lead:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to distribute lead' },
      { status: 500 }
    )
  }
}
