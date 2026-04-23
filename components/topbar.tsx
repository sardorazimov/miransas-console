'use client'

import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'
import { useProject } from '@/hooks/use-project'

const LABELS: Record<string, string> = {
  dashboard: 'dashboard',
  projects: 'projects',
  databases: 'databases',
  secrets: 'secrets',
  audit: 'audit',
  tables: 'tables',
  sql: 'sql',
  schema: 'schema',
  users: 'users',
  settings: 'settings',
}

function ProjectNameSegment({ id }: { id: string }) {
  const { data } = useProject(id)
  return <span>{data?.name ?? id}</span>
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)

  // Check if we're on a /projects/[id]/... route
  const isProjectRoute =
    segments.length >= 2 && segments[0] === 'projects' && segments[1] && !LABELS[segments[1]]

  return (
    <div className="flex items-center gap-2.5 font-mono text-sm">
      <span className="text-[#8CFF2E]">~</span>
      {segments.length === 0 ? (
        <span className="text-white/60">/</span>
      ) : (
        segments.map((seg, index) => {
          const isLast = index === segments.length - 1
          const isProjectId = isProjectRoute && index === 1
          const isTableName =
            isProjectRoute && segments[2] === 'tables' && index === 3

          let label: React.ReactNode
          if (isProjectId) {
            label = <ProjectNameSegment id={seg} />
          } else if (isTableName) {
            label = <span className="font-mono">{seg}</span>
          } else {
            label = LABELS[seg] ?? seg
          }

          return (
            <div key={`${seg}-${index}`} className="flex items-center gap-2.5">
              <span className="text-white/20">/</span>
              <span
                className={cn(
                  'transition-colors',
                  isLast ? 'text-white font-medium' : 'text-white/50'
                )}
              >
                {label}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

export function Topbar() {
  const pathname = usePathname()

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40 shrink-0">
      <Breadcrumb pathname={pathname} />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8CFF2E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8CFF2E]"></span>
          </span>
          <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest">
            admin_active
          </span>
        </div>
        <div className="border-l border-white/10 pl-6 flex items-center">
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
