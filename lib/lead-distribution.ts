import { prisma } from './prisma'
import { broadcastLeadAssignment } from './socket-io'

const QUOTA_LIMIT = 10

export async function distributeLead(serviceId: string, phone: string, email?: string, name?: string) {
  // Check for duplicate lead
  const existingLead = await prisma.lead.findFirst({
    where: { 
      phone,
      service_id: serviceId,
    },
  })

  if (existingLead) {
    throw new Error('Lead already exists for this phone number and service')
  }

  // Get mandatory providers for this service
  const mandatoryProviders = await prisma.providerAssignment.findMany({
    where: {
      service_id: serviceId,
      is_mandatory: true,
    },
    include: {
      provider: true,
    },
  })

  // Get all providers for this service
  const allProviders = await prisma.providerAssignment.findMany({
    where: { service_id: serviceId },
    include: { provider: true },
  })

  if (allProviders.length === 0) {
    throw new Error('No providers assigned to this service')
  }

  // Create the lead
  const lead = await prisma.lead.create({
    data: {
      service_id: serviceId,
      phone,
      email,
      name,
    },
  })

  const assignedProviders: string[] = []

  // Assign to mandatory providers
  for (const assignment of mandatoryProviders) {
    const providerId = assignment.provider_id
    const quota = await getCurrentMonthQuota(providerId)

    if (quota < QUOTA_LIMIT) {
      await prisma.assignedLead.create({
        data: {
          lead_id: lead.id,
          provider_id: providerId,
        },
      })
      assignedProviders.push(providerId)
    }
  }

  // Get available providers (not yet assigned, with available quota)
  const availableProviders = await Promise.all(
    allProviders
      .filter(a => !assignedProviders.includes(a.provider_id))
      .map(async (a) => {
        const quota = await getCurrentMonthQuota(a.provider_id)
        return quota < QUOTA_LIMIT ? a : null
      })
  )

  const validAvailable = availableProviders.filter(Boolean) as typeof allProviders

  // Round-robin allocation from available providers
  if (validAvailable.length > 0) {
    const pointer = await prisma.allocationPointer.findFirst({
      where: {
        service_id: serviceId,
        provider_id: validAvailable[0].provider_id,
      },
    })

    let currentPosition = pointer?.current_position ?? 0
    currentPosition = currentPosition % validAvailable.length

    const selectedProvider = validAvailable[currentPosition]
    await prisma.assignedLead.create({
      data: {
        lead_id: lead.id,
        provider_id: selectedProvider.provider_id,
      },
    })
    assignedProviders.push(selectedProvider.provider_id)

    // Update pointer for next round
    const newPosition = (currentPosition + 1) % validAvailable.length
    const existingPointer = await prisma.allocationPointer.findFirst({
      where: {
        service_id: serviceId,
        provider_id: selectedProvider.provider_id,
      },
    })

    if (existingPointer) {
      await prisma.allocationPointer.update({
        where: { id: existingPointer.id },
        data: { current_position: newPosition },
      })
    } else {
      await prisma.allocationPointer.create({
        data: {
          service_id: serviceId,
          provider_id: selectedProvider.provider_id,
          current_position: newPosition,
        },
      })
    }
  }

  // Log quota usage
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  for (const providerId of assignedProviders) {
    const existingLog = await prisma.providerQuotaLog.findFirst({
      where: {
        provider_id: providerId,
        month_start_date: monthStart,
      },
    })

    if (existingLog) {
      await prisma.providerQuotaLog.update({
        where: { id: existingLog.id },
        data: {
          leads_assigned_this_month: {
            increment: 1,
          },
        },
      })
    } else {
      await prisma.providerQuotaLog.create({
        data: {
          provider_id: providerId,
          leads_assigned_this_month: 1,
          month_start_date: monthStart,
        },
      })
    }

    // Broadcast to connected providers
    try {
      broadcastLeadAssignment(providerId, {
        lead,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('[v0] Failed to broadcast lead assignment:', error)
    }
  }

  return {
    lead,
    assignedProviders,
  }
}

async function getCurrentMonthQuota(providerId: string): Promise<number> {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const quotaLog = await prisma.providerQuotaLog.findUnique({
    where: {
      provider_id_month_start_date: {
        provider_id: providerId,
        month_start_date: monthStart,
      },
    },
  })

  return quotaLog?.leads_assigned_this_month ?? 0
}

export async function getProviderDashboard(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      assignedLeads: {
        include: {
          lead: true,
        },
      },
    },
  })

  if (!provider) {
    throw new Error('Provider not found')
  }

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const quotaLog = await prisma.providerQuotaLog.findFirst({
    where: {
      provider_id: providerId,
      month_start_date: monthStart,
    },
  })

  const leadsAssigned = quotaLog?.leads_assigned_this_month ?? 0
  const remainingQuota = Math.max(0, QUOTA_LIMIT - leadsAssigned)

  return {
    provider,
    leadsAssigned,
    remainingQuota,
    quotaLimit: QUOTA_LIMIT,
    leads: provider.assignedLeads.map(al => al.lead),
  }
}

export async function resetQuotaForProvider(providerId: string) {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const existingLog = await prisma.providerQuotaLog.findFirst({
    where: {
      provider_id: providerId,
      month_start_date: monthStart,
    },
  })

  if (existingLog) {
    await prisma.providerQuotaLog.update({
      where: { id: existingLog.id },
      data: { leads_assigned_this_month: 0 },
    })
  } else {
    await prisma.providerQuotaLog.create({
      data: {
        provider_id: providerId,
        leads_assigned_this_month: 0,
        month_start_date: monthStart,
      },
    })
  }
}
