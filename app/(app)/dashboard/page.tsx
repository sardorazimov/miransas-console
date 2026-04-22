import { serverFetch } from '@/lib/server-api'
import { StatCard } from '@/components/stat-card'
import type { AdminSummary } from '@/types/api'

export default async function DashboardPage() {
  const summary = await serverFetch<AdminSummary>('/admin/summary')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-[oklch(0.95_0_0)]">Overview</h2>
        <p className="text-xs text-[oklch(0.55_0_0)] mt-0.5">
          Last refreshed: {new Date(summary.generated_at).toISOString().slice(0, 19).replace('T', ' ')} UTC
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" value={summary.project_count} href="/projects" />
        <StatCard label="Databases" value={summary.database_count} />
        <StatCard label="Secrets" value={summary.secret_count} />
        <StatCard label="Audit logs" value={summary.audit_log_count} />
      </div>
    </div>
  )
}
