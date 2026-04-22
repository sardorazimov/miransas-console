import Link from 'next/link'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number
  href?: string
}

export function StatCard({ label, value, href }: StatCardProps) {
  const content = (
    <div className="rounded-[6px] border border-[oklch(0.22_0_0)] bg-[oklch(0.175_0_0)] px-5 py-4 flex flex-col gap-1 hover:border-[oklch(0.3_0_0)] transition-colors">
      <span className="text-xs text-[oklch(0.55_0_0)] uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
