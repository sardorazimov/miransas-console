import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string // "99.9%" veya "1.2k" gibi string değerler de gelebilir diye string ekledim
  href?: string
}

export function StatCard({ label, value, href }: StatCardProps) {
  const content = (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] p-5 flex flex-col gap-3 transition-all duration-300",
      href ? "cursor-pointer hover:border-[#8CFF2E]/50 hover:bg-[#0a0a0a]/80 hover:shadow-[0_0_20px_rgba(140,255,46,0.07)]" : "cursor-default"
    )}>
      {/* Üst kısma ince bir ışık süzmesi (gradient) ekliyoruz */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#8CFF2E]/40 transition-colors duration-500" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-muted)] uppercase tracking-widest font-semibold">
          {label}
        </span>
        {href && (
          <ArrowUpRight
            size={18}
            className="text-[var(--color-muted)] opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[#8CFF2E] transition-all duration-300"
          />
        )}
      </div>
      
      {/* Rakam kısmı - fira code fontuyla çok iyi duracak */}
      <span className="text-4xl font-semibold tabular-nums font-mono text-white tracking-tight">
        {value}
      </span>
    </div>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[#8CFF2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] rounded-xl transition-all"
      >
        {content}
      </Link>
    )
  }
  
  return content
}