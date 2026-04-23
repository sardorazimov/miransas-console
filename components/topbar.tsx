'use client'

import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

function buildBreadcrumb(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'Console'
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    databases: 'Databases',
    secrets: 'Secrets',
    audit: 'Audit',
  }
  return segments
    .map((seg) => labels[seg] ?? seg)
    .join(' / ')
}

export function Topbar() {
  const pathname = usePathname()
  const breadcrumb = buildBreadcrumb(pathname)

  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)] shrink-0">
      <span className="text-sm text-[var(--color-fg-muted)]">{breadcrumb}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] shrink-0" />
          <span className="text-xs text-[var(--color-fg-muted)]">admin</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
