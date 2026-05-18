import { NextResponse } from 'next/server'
import { getProviderDashboard } from '@/lib/lead-distribution'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json(
        { error: 'Missing providerId parameter' },
        { status: 400 }
      )
    }

    const dashboard = await getProviderDashboard(providerId)
    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}
