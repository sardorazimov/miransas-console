'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderGit2, Database, KeyRound, FileClock, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'Projects', href: '/projects', icon: FolderGit2, enabled: true },
  { label: 'Databases', href: '/databases', icon: Database, enabled: false },
  { label: 'Secrets', href: '/secrets', icon: KeyRound, enabled: false },
  { label: 'Audit', href: '/audit', icon: FileClock, enabled: false },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-[var(--color-border)] flex items-center gap-1.5">
        <span className="text-sm font-semibold text-[var(--color-fg)]">miransas</span>
        <span className="w-1 h-1 rounded-full bg-[var(--color-muted)] shrink-0" />
        <span className="text-xs text-[var(--color-muted)]">console</span>
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
                'flex items-center gap-2.5 px-3 h-8 rounded-md text-sm transition-colors relative',
                isActive && item.enabled
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-fg)] border-l-2 border-[var(--color-accent)] -ml-0.5 pl-[11px]'
                  : item.enabled
                  ? 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]'
                  : 'text-[var(--color-fg-muted)] opacity-40 cursor-not-allowed pointer-events-none'
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {!item.enabled && (
                <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] leading-none">
                  soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-3 border-t border-[var(--color-border)] pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 h-8 w-full rounded-md text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)] transition-colors"
        >
          <LogOut size={16} className="shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  )
}
