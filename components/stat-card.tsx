import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  href?: string
}

export function StatCard({ label, value, href }: StatCardProps) {
  const content = (
    <div className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 flex flex-col gap-2 hover:border-[var(--color-border-hover)] transition-colors cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-medium">
          {label}
        </span>
        {href && (
          <ArrowUpRight
            size={14}
            className="text-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </div>
      <span className="text-3xl font-semibold tabular-nums font-mono text-[var(--color-fg)]">
        {value}
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }
  return content
}
