'use client'

import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/databases': 'Databases',
  '/secrets': 'Secrets',
  '/audit': 'Audit',
}

export function Topbar() {
  const pathname = usePathname()
  const title = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Console'

  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-[oklch(0.22_0_0)] shrink-0">
      <span className="text-sm font-medium text-[oklch(0.95_0_0)]">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[oklch(0.55_0_0)]">admin</span>
        <LogoutButton />
      </div>
    </header>
  )
}
