import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-muted">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Lead Distribution System</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            A comprehensive system for intelligently distributing sales leads to providers with
            quota management, mandatory assignments, and fair round-robin allocation.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer Request Form */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">Request Service</h2>
              <p className="text-muted-foreground mt-2">
                Submit a lead request and have it automatically distributed to the right providers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Submit customer leads with phone and email</li>
                  <li>Automatic duplicate prevention</li>
                  <li>Fair distribution to multiple providers</li>
                  <li>Real-time assignment confirmation</li>
                </ul>
              </div>

              <Link href="/request-service" className="block">
                <Button className="w-full">Request Service</Button>
              </Link>
            </div>
          </Card>

          {/* Provider Dashboard */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">Provider Dashboard</h2>
              <p className="text-muted-foreground mt-2">
                Track assigned leads and monitor your monthly quota status.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Features:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Real-time lead notifications via WebSockets</li>
                  <li>Monthly quota tracking and progress</li>
                  <li>Complete lead details with contact info</li>
                  <li>Auto-refreshing on new assignments</li>
                </ul>
              </div>

              <Link href="/dashboard" className="block">
                <Button className="w-full">View Dashboard</Button>
              </Link>
            </div>
          </Card>

          {/* Test Tools */}
          <Card className="p-6 hover:shadow-lg transition-shadow md:col-span-2">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">Test Tools</h2>
              <p className="text-muted-foreground mt-2">
                Generate test data, manage quotas, and debug the system.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Available Actions:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View all services and providers</li>
                  <li>Generate bulk test leads with random data</li>
                  <li>Reset provider quotas for testing</li>
                  <li>Debug distribution algorithm</li>
                </ul>
              </div>

              <Link href="/test-tools" className="block">
                <Button className="w-full">Test Tools</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-8 mt-12 bg-muted/50">
          <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Lead Submission</h3>
              <p className="text-muted-foreground">
                Customers submit their information including phone number, email, and name. The
                system prevents duplicate leads by checking phone+service uniqueness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Mandatory Assignments</h3>
              <p className="text-muted-foreground">
                Leads are first assigned to all mandatory providers for that service (if they have
                available quota). This ensures key partners always get qualified leads.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Fair Distribution</h3>
              <p className="text-muted-foreground">
                Remaining quota is distributed using fair round-robin allocation. The system
                maintains a pointer that survives restarts, ensuring truly balanced distribution
                across available providers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Quota Management</h3>
              <p className="text-muted-foreground">
                Each provider has a 10-lead monthly quota that resets on the first of each month.
                The system tracks usage and prevents over-allocation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Real-Time Notifications</h3>
              <p className="text-muted-foreground">
                WebSocket connections deliver instant lead assignments to provider dashboards,
                allowing them to immediately see new opportunities without polling.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
