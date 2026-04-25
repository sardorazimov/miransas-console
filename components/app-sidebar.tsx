'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderGit2, 
  Database, 
  KeyRound, 
  FileClock, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'Projects', href: '/projects', icon: FolderGit2, enabled: true },
  { label: 'Databases', href: '/databases', icon: Database, enabled: false },
  { label: 'Secrets', href: '/secrets', icon: KeyRound, enabled: true },
  { label: 'Audit', href: '/audit', icon: FileClock, enabled: false },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside 
      className={cn(
        "shrink-0 flex flex-col border-r border-white/10 h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-[68px]" : "w-[220px]"
      )}
    >
      {/* Header Alanı */}
      <div className={cn(
        "py-4 border-b border-white/10 flex items-center h-[60px]",
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-lg font-semibold text-white">miransas</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-muted)] shrink-0" />
            <span className="text-lg text-[var(--color-muted)]">console</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-[var(--color-fg-muted)] hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigasyon Linkleri */}
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
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center h-8 rounded-md text-sm transition-all relative overflow-hidden',
                isCollapsed ? 'justify-center w-8 px-0 mx-auto' : 'gap-2.5 px-3',
                
                // Aktif ve aktif olmayan durumların stilleri
                isActive && item.enabled
                  ? cn(
                      'bg-[#050505] text-[#8CFF2E]', // İstediğin renkler
                      !isCollapsed && 'border-l-2 border-[#8CFF2E] -ml-0.5 pl-[11px]'
                    )
                  : item.enabled
                  ? 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]'
                  : 'text-[var(--color-fg-muted)] opacity-40 cursor-not-allowed pointer-events-none'
              )}
            >
              <Icon size={16} className="shrink-0" />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {!item.enabled && (
                    <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] leading-none">
                      soon
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      
      <div className="px-2 pb-3 border-t border-[var(--color-border)] pt-2 flex justify-center">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center h-8 rounded-md text-sm text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)] transition-colors",
            isCollapsed ? "justify-center w-8 px-0" : "gap-2.5 px-3 w-full"
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  )
}