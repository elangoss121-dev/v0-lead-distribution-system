'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function TestToolsPage() {
  const [serviceId, setServiceId] = useState('')
  const [providerId, setProviderId] = useState('')
  const [leadCount, setLeadCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])

  async function loadServices() {
    try {
      const response = await fetch('/api/test-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-services' }),
      })
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  async function loadProviders() {
    try {
      const response = await fetch('/api/test-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-providers' }),
      })
      const data = await response.json()
      setProviders(data)
    } catch (error) {
      console.error('Error loading providers:', error)
    }
  }

  async function generateLeads() {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/test-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-leads',
          serviceId,
          count: leadCount,
        }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to generate leads' })
    } finally {
      setLoading(false)
    }
  }

  async function resetQuota() {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/test-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-quota',
          providerId,
        }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Failed to reset quota' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Tools</h1>
          <p className="text-muted-foreground mt-2">Generate test data and manage system state</p>
        </div>

        {/* Generate Leads */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Generate Test Leads</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Service ID</label>
              <Input
                type="text"
                placeholder="Enter service ID"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Leads
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={leadCount}
                onChange={(e) => setLeadCount(parseInt(e.target.value) || 5)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={loadServices}
                variant="outline"
                className="flex-1"
              >
                Load Services
              </Button>
              <Button
                onClick={generateLeads}
                disabled={loading || !serviceId}
                className="flex-1"
              >
                {loading ? 'Generating...' : 'Generate Leads'}
              </Button>
            </div>

            {services.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Available Services:</p>
                <div className="space-y-1">
                  {services.map((service) => (
                    <p key={service.id} className="text-sm text-muted-foreground">
                      {service.name} - {service.id}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Reset Quota */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Reset Provider Quota</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Provider ID
              </label>
              <Input
                type="text"
                placeholder="Enter provider ID"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={loadProviders}
                variant="outline"
                className="flex-1"
              >
                Load Providers
              </Button>
              <Button
                onClick={resetQuota}
                disabled={loading || !providerId}
                className="flex-1"
              >
                {loading ? 'Resetting...' : 'Reset Quota'}
              </Button>
            </div>

            {providers.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Available Providers:</p>
                <div className="space-y-1">
                  {providers.map((provider) => (
                    <p key={provider.id} className="text-sm text-muted-foreground">
                      {provider.name} - {provider.id}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Result</h2>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </main>
  )
}
