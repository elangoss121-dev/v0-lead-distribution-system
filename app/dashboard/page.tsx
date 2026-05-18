'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Lead {
  id: string
  phone: string
  email?: string
  name?: string
  created_at: string
}

interface DashboardData {
  provider: {
    id: string
    name: string
    email: string
  }
  leadsAssigned: number
  remainingQuota: number
  quotaLimit: number
  leads: Lead[]
}

export default function DashboardPage() {
  const [providerId, setProviderId] = useState('')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      console.log('[v0] Connected to WebSocket')
    })

    newSocket.on('lead_assigned', (leadData) => {
      console.log('[v0] New lead assigned:', leadData)
      // Refresh dashboard data
      if (providerId) {
        fetchDashboard(providerId)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('[v0] Disconnected from WebSocket')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  async function fetchDashboard(id: string) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dashboard?providerId=${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard')
      }

      setDashboardData(data)

      // Subscribe to provider updates
      if (socket) {
        socket.emit('subscribe-provider', id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  function handleViewDashboard() {
    if (!providerId.trim()) {
      setError('Please enter a Provider ID')
      return
    }
    fetchDashboard(providerId)
  }

  if (!dashboardData) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-6">Provider Dashboard</h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Provider ID
                </label>
                <Input
                  type="text"
                  placeholder="Enter your provider ID"
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                />
              </div>

              {error && <div className="p-4 bg-red-100 text-red-800 rounded text-sm">{error}</div>}

              <Button onClick={handleViewDashboard} disabled={loading} className="w-full">
                {loading ? 'Loading...' : 'View Dashboard'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{dashboardData.provider.name}</h1>
              <p className="text-sm text-muted-foreground mt-2">{dashboardData.provider.email}</p>
            </div>
            <Button onClick={() => setDashboardData(null)} variant="outline">
              Back
            </Button>
          </div>
        </Card>

        {/* Quota Status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Quota</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Leads Assigned</span>
                <span className="font-semibold">
                  {dashboardData.leadsAssigned} / {dashboardData.quotaLimit}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(dashboardData.leadsAssigned / dashboardData.quotaLimit) * 100}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Remaining quota: {dashboardData.remainingQuota} leads
            </p>
          </div>
        </Card>

        {/* Assigned Leads */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Assigned Leads ({dashboardData.leads.length})
          </h2>

          {dashboardData.leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads assigned yet</p>
          ) : (
            <div className="space-y-3">
              {dashboardData.leads.map((lead) => (
                <div key={lead.id} className="border border-muted rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {lead.name && (
                        <p className="font-medium text-foreground">{lead.name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      {lead.email && (
                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
