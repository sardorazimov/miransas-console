'use client'

import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  
  const labels: Record<string, string> = {
    dashboard: 'dashboard',
    projects: 'projects',
    databases: 'databases',
    secrets: 'secrets',
    audit: 'audit',
  }

  return (
    <div className="flex items-center gap-2.5 font-mono text-sm">
      <span className="text-[#8CFF2E]">~</span>
      {segments.length === 0 ? (
        <span className="text-white/60">/</span>
      ) : (
        segments.map((seg, index) => {
          const isLast = index === segments.length - 1
          const label = labels[seg] ?? seg
          
          return (
            <div key={seg} className="flex items-center gap-2.5">
              <span className="text-white/20">/</span>
              <span className={cn(
                "transition-colors",
                isLast ? "text-white font-medium shadow-[#8CFF2E]" : "text-white/50"
              )}>
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
      
      {/* Sol Kısım: Terminal Style Breadcrumb */}
      <Breadcrumb pathname={pathname} />

      {/* Sağ Kısım: Admin Status & Logout */}
      <div className="flex items-center gap-6">
        
        {/* Canlı Sistem Göstergesi (Pulsing Dot) */}
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8CFF2E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8CFF2E]"></span>
          </span>
          <span className="text-[11px] font-mono text-white/70 uppercase tracking-widest">
            admin_active
          </span>
        </div>

        {/* Senin mevcut logout butonun */}
        <div className="border-l border-white/10 pl-6 flex items-center">
          <LogoutButton />
        </div>

      </div>
    </header>
  )
}