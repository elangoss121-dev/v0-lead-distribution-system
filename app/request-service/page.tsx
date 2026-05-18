'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface Service {
  id: string
  name: string
  description?: string
}

export default function RequestServicePage() {
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    serviceId: '',
    phone: '',
    email: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [loadingServices, setLoadingServices] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch available services on mount
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services')
        const data = await response.json()
        if (data.services) {
          setServices(data.services)
          if (data.services.length > 0) {
            setFormData(prev => ({ ...prev, serviceId: data.services[0].id }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch services:', error)
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          idempotencyKey: `${formData.phone}-${Date.now()}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setMessage({
        type: 'success',
        text: `Lead created and assigned to ${data.assignedProviders.length} provider(s)`,
      })
      setFormData({ ...formData, phone: '', email: '', name: '' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Request Service</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Service
              </label>
              {loadingServices ? (
                <div className="text-muted-foreground text-sm">Loading services...</div>
              ) : services.length === 0 ? (
                <div className="text-muted-foreground text-sm">No services available</div>
              ) : (
                <select
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  required
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email (optional)
              </label>
              <Input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name (optional)
              </label>
              <Input
                type="text"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || services.length === 0}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>

          {message && (
            <div
              className={`mt-4 p-4 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {message.text}
            </div>
          )}
        </Card>

        <div className="mt-4 text-center">
          <a href="/" className="text-primary hover:underline">
            Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}
