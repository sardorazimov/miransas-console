'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Database, KeyRound, ClipboardList, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'Projects', href: '/projects', icon: FolderOpen, enabled: true },
  { label: 'Databases', href: '/databases', icon: Database, enabled: false },
  { label: 'Secrets', href: '/secrets', icon: KeyRound, enabled: false },
  { label: 'Audit', href: '/audit', icon: ClipboardList, enabled: false },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-[oklch(0.22_0_0)] bg-[oklch(0.145_0_0)] h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-[oklch(0.22_0_0)]">
        <span className="text-sm font-semibold tracking-tight text-[oklch(0.95_0_0)]">
          miransas console
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.enabled ? item.href : '#'}
              aria-disabled={!item.enabled}
              tabIndex={item.enabled ? undefined : -1}
              className={cn(
                'flex items-center gap-2.5 px-3 h-8 rounded-[6px] text-sm transition-colors',
                isActive && item.enabled
                  ? 'bg-[oklch(0.22_0_0)] text-[oklch(0.95_0_0)]'
                  : item.enabled
                  ? 'text-[oklch(0.55_0_0)] hover:bg-[oklch(0.2_0_0)] hover:text-[oklch(0.85_0_0)]'
                  : 'text-[oklch(0.35_0_0)] cursor-not-allowed pointer-events-none'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-3 border-t border-[oklch(0.22_0_0)] pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 h-8 w-full rounded-[6px] text-sm text-[oklch(0.55_0_0)] hover:bg-[oklch(0.2_0_0)] hover:text-[oklch(0.85_0_0)] transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
