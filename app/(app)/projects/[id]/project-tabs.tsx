'use client'

import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Tables', path: 'tables' },
  { label: 'SQL', path: 'sql' },
  { label: 'Schema', path: 'schema' },
  { label: 'Users', path: 'users' },
  { label: 'Settings', path: 'settings' },
]

interface ProjectTabsProps {
  projectId: string
  children: React.ReactNode
}

export function ProjectTabs({ projectId, children }: ProjectTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  function getTabHref(tabPath: string) {
    const base = `/projects/${projectId}`
    return tabPath ? `${base}/${tabPath}` : base
  }

  function isActive(tabPath: string) {
    const href = getTabHref(tabPath)
    if (tabPath === '') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div>
      <div className="flex border-b border-[var(--color-border)] mb-6 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.path}
            type="button"
            onClick={() => router.push(getTabHref(tab.path))}
            className={cn(
              'h-9 px-4 text-sm font-medium transition-colors border-b-2 -mb-px',
              isActive(tab.path)
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}
