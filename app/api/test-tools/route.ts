import { NextRequest, NextResponse } from 'next/server'
import { resetQuotaForProvider, distributeLead } from '@/lib/lead-distribution'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { action, providerId, serviceId, count } = await req.json()

    if (action === 'reset-quota') {
      if (!providerId) {
        return NextResponse.json(
          { error: 'Missing providerId' },
          { status: 400 }
        )
      }
      await resetQuotaForProvider(providerId)
      return NextResponse.json({ message: 'Quota reset successfully' })
    }

    if (action === 'generate-leads') {
      if (!serviceId) {
        return NextResponse.json(
          { error: 'Missing serviceId' },
          { status: 400 }
        )
      }

      const leadCount = count || 5
      const results = []

      for (let i = 0; i < leadCount; i++) {
        try {
          const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
          const result = await distributeLead(
            serviceId,
            phone,
            `test${Date.now()}-${i}@example.com`,
            `Test Lead ${i}`
          )
          results.push(result)
        } catch (error) {
          // Lead might already exist, continue
          if ((error as Error).message.includes('already exists')) {
            i--
            continue
          }
        }
      }

      return NextResponse.json({
        message: `Generated ${results.length} test leads`,
        results,
      })
    }

    if (action === 'list-providers') {
      const providers = await prisma.provider.findMany()
      return NextResponse.json(providers)
    }

    if (action === 'list-services') {
      const services = await prisma.service.findMany()
      return NextResponse.json(services)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in test tools:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Test operation failed' },
      { status: 500 }
    )
  }
}
