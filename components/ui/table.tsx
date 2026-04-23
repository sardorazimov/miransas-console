'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './tooltip'

interface DataTableProps {
  columns: string[]
  rows: Record<string, unknown>[]
  actions?: (row: Record<string, unknown>) => React.ReactNode
  loading?: boolean
  error?: string
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function CellValue({ value }: { value: unknown }) {
  const str = formatValue(value)
  if (str.length > 80) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate block max-w-[200px] cursor-default font-mono text-xs">
              {str}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs break-all font-mono text-xs">{str}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return <span className="font-mono text-xs">{str}</span>
}

export function DataTable({ columns, rows, actions, loading, error }: DataTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
        <div className="h-9 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 border-b border-[var(--color-border)] last:border-0 bg-[var(--color-surface-2)]/30 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
        <div className="h-9 px-3 flex items-center text-sm text-red-400">
          Failed: {error}
        </div>
      </div>
    )
  }

  const cols = actions ? [...columns, ''] : columns

  return (
    <div className="rounded-md border border-[var(--color-border)] overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-max">
        <thead>
          <tr className="h-9 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
            {cols.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'px-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider whitespace-nowrap',
                  col === '' && 'w-10'
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                className="h-9 px-3 text-sm text-[var(--color-muted)] text-center"
              >
                No rows
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={ri}
                className="h-9 border-b border-[var(--color-border)] last:border-0 hover:bg-white/[0.02]"
              >
                {columns.map((col, ci) => (
                  <td key={ci} className="px-3 text-[var(--color-fg)] max-w-[240px]">
                    <CellValue value={row[col]} />
                  </td>
                ))}
                {actions && (
                  <td className="px-2 text-right whitespace-nowrap">{actions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
