'use client'

import { useState } from 'react'
import { Scroll } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuditLogs } from '@/hooks/use-audit-logs'
import type { AuditLog } from '@/types/api'

const ACTION_COLOR: Record<string, string> = {
  'project.created': 'text-[var(--color-success)]',
  'project.deleted': 'text-[var(--color-danger)]',
  'project.connection_revealed': 'text-[var(--color-fg-muted)]',
  'project.password_reset': 'text-[var(--color-danger)]',
  'secret.created': 'text-[var(--color-success)]',
  'secret.deleted': 'text-[var(--color-danger)]',
  'secret.revealed': 'text-[var(--color-fg-muted)]',
  'auth.login': 'text-[var(--color-success)]',
  'auth.failed': 'text-[var(--color-danger)]',
}

function DetailRow({
  label,
  value,
  mono,
  small,
}: {
  label: string
  value: string
  mono?: boolean
  small?: boolean
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-3">
      <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider pt-0.5">
        {label}
      </div>
      <div className={`text-sm ${mono ? 'font-mono' : ''} ${small ? 'text-xs break-all' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function AuditRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false)
  const timeStr =
    new Date(log.created_at).toISOString().slice(0, 19).replace('T', ' ') + ' UTC'
  const actionColor = ACTION_COLOR[log.action] ?? 'text-[var(--color-fg)]'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid grid-cols-[180px_140px_1fr_120px_60px] h-9 border-b border-[var(--color-border)] last:border-b-0 px-4 items-center text-sm hover:bg-[var(--color-surface-2)]/50 transition-colors text-left w-full"
      >
        <div className="font-mono text-xs text-[var(--color-fg-muted)]">{timeStr}</div>
        <div className={`font-mono text-xs ${actionColor}`}>{log.action}</div>
        <div className="font-mono text-xs text-[var(--color-fg-muted)] truncate">
          {log.resource_type && log.resource_id
            ? `${log.resource_type}/${log.resource_id.slice(0, 8)}...`
            : log.resource_type || '—'}
        </div>
        <div className="font-mono text-xs text-[var(--color-fg-muted)] truncate">
          {log.actor || '—'}
        </div>
        <div className="text-[var(--color-muted)] text-xs text-right">→</div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="font-mono">{log.action}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <DetailRow label="ID" value={log.id} mono />
            <DetailRow label="Time" value={new Date(log.created_at).toLocaleString()} />
            <DetailRow label="Resource type" value={log.resource_type || '—'} mono />
            <DetailRow label="Resource ID" value={log.resource_id || '—'} mono />
            <DetailRow label="Actor" value={log.actor || '—'} mono />
            <DetailRow label="IP" value={log.ip_address || '—'} mono />
            <DetailRow label="User Agent" value={log.user_agent || '—'} mono small />
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div>
                <div className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">
                  Metadata
                </div>
                <pre className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-3 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const [resourceType, setResourceType] = useState('')
  const limit = 50

  const { data, isLoading } = useAuditLogs({
    page,
    limit,
    resource_type: resourceType || undefined,
  })

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Scroll className="h-5 w-5 text-[var(--color-accent)]" />
          <h1 className="text-xl font-semibold">Audit</h1>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Track every action performed on this miransas instance.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value)
            setPage(1)
          }}
          className="h-9 px-3 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md font-mono text-[var(--color-fg)]"
        >
          <option value="">All resources</option>
          <option value="project">Project</option>
          <option value="secret">Secret</option>
          <option value="schema">Schema</option>
          <option value="user">User</option>
          <option value="auth">Auth</option>
        </select>
        <div className="text-xs text-[var(--color-muted)] ml-auto font-mono">
          {data ? `${data.total} events` : 'Loading...'}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[180px_140px_1fr_120px_60px] h-9 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] px-4 items-center">
          <div>Time</div>
          <div>Action</div>
          <div>Resource</div>
          <div>Actor</div>
          <div />
        </div>

        {isLoading && (
          <div className="px-4 py-8 text-sm text-[var(--color-muted)] text-center">
            Loading audit logs...
          </div>
        )}

        {!isLoading && data?.rows.length === 0 && (
          <div className="px-4 py-8 text-sm text-[var(--color-muted)] text-center">
            No audit logs yet.
          </div>
        )}

        {data?.rows.map((log) => (
          <AuditRow key={log.id} log={log} />
        ))}
      </div>

      {data && data.total > limit && (
        <div className="flex items-center justify-between mt-4 text-xs text-[var(--color-muted)]">
          <div className="font-mono">
            Page {data.page} of {Math.ceil(data.total / limit)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page * limit >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
