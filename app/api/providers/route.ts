import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get('serviceId')

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing serviceId parameter' },
        { status: 400 }
      )
    }

    const providers = await prisma.providerAssignment.findMany({
      where: { service_id: serviceId },
      include: {
        provider: true,
      },
    })

    return NextResponse.json(providers.map(p => ({ ...p.provider, is_mandatory: p.is_mandatory })))
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}
