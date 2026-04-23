import { Activity } from 'lucide-react'
import { serverFetch } from '@/lib/server-api'
import { StatCard } from '@/components/stat-card'
import type { AdminSummary } from '@/types/api'

export default async function DashboardPage() {
  const summary = await serverFetch<AdminSummary>('/admin/summary')

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Sayfa Başlığı */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="text-[#8CFF2E]" size={24} />
            Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-1.5 max-w-md">
            Overview of your miransas infrastructure and active services.
          </p>
        </div>
      </div>

      {/* İstatistik Kartları Grid'i */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Projects" value={summary.project_count} href="/projects" />
        <StatCard label="Databases" value={summary.database_count} />
        <StatCard label="Secrets" value={summary.secret_count} />
        <StatCard label="Audit events" value={summary.audit_log_count} />
      </div>

      {/* Terminal Style Son Güncelleme Bilgisi */}
      <div className="mt-4 border-t border-white/10 pt-6">
        <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
          {/* Yanıp Sönen Ufak Neon Nokta */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8CFF2E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8CFF2E]"></span>
          </span>
          
          <span className="text-[11px] text-white/50 font-mono tracking-wider uppercase">
            System Sync: <span className="text-white/80">{new Date(summary.generated_at).toISOString().slice(0, 19).replace('T', ' ')} UTC</span>
          </span>
        </div>
      </div>
      
    </div>
  )
}