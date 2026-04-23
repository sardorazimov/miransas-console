import { serverFetch } from '@/lib/server-api'
import { StatCard } from '@/components/stat-card'
import type { AdminSummary } from '@/types/api'

export default async function DashboardPage() {
  const summary = await serverFetch<AdminSummary>('/admin/summary')

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-fg)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Overview of your miransas infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Projects" value={summary.project_count} href="/projects" />
        <StatCard label="Databases" value={summary.database_count} />
        <StatCard label="Secrets" value={summary.secret_count} />
        <StatCard label="Audit events" value={summary.audit_log_count} />
      </div>

      <p className="text-xs text-[var(--color-muted)] font-mono tabular-nums">
        Last refreshed:{' '}
        {new Date(summary.generated_at).toISOString().slice(0, 19).replace('T', ' ')} UTC
      </p>
    </div>
  )
}
