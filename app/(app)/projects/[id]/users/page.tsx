'use client'

import { use, useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Settings, MoreHorizontal, Search, Download, Eye, EyeOff, Ban, Trash2, Key, Users } from 'lucide-react'
import { useUserConfig, usePutUserConfig } from '@/hooks/use-user-config'
import { useProjectUsers } from '@/hooks/use-users'
import { api } from '@/lib/api'
import type { ProjectUserConfig } from '@/types/api'
import { DataTable } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'

const PAGE_SIZE = 50

function UserConfigDialog({
  open,
  onOpenChange,
  projectId,
  initial,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  initial?: ProjectUserConfig | null
}) {
  const put = usePutUserConfig(projectId)
  const [form, setForm] = useState({
    users_table: initial?.users_table ?? 'users',
    id_column: initial?.id_column ?? 'id',
    email_column: initial?.email_column ?? '',
    username_column: initial?.username_column ?? '',
    password_column: initial?.password_column ?? '',
    banned_column: initial?.banned_column ?? '',
    password_algorithm: initial?.password_algorithm ?? 'plaintext',
    searchable_columns: initial?.searchable_columns.join(', ') ?? '',
  })

  useEffect(() => {
    if (initial) {
      setForm({
        users_table: initial.users_table,
        id_column: initial.id_column,
        email_column: initial.email_column ?? '',
        username_column: initial.username_column ?? '',
        password_column: initial.password_column ?? '',
        banned_column: initial.banned_column ?? '',
        password_algorithm: initial.password_algorithm,
        searchable_columns: initial.searchable_columns.join(', '),
      })
    }
  }, [initial])

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit() {
    try {
      await put.mutateAsync({
        users_table: form.users_table || undefined,
        id_column: form.id_column || undefined,
        email_column: form.email_column || null,
        username_column: form.username_column || null,
        password_column: form.password_column || null,
        banned_column: form.banned_column || null,
        password_algorithm: form.password_algorithm,
        searchable_columns: form.searchable_columns
          ? form.searchable_columns.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      })
      toast.success('Config saved')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader>
          <DialogTitle>User config</DialogTitle>
          <DialogDescription>Configure which table and columns store users.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {(
            [
              ['users_table', 'Users table *', 'users'],
              ['id_column', 'ID column *', 'id'],
              ['email_column', 'Email column', 'email'],
              ['username_column', 'Username column', 'username'],
              ['password_column', 'Password column', 'password_hash'],
              ['banned_column', 'Banned column', 'is_banned'],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <Input
                value={form[key]}
                onChange={field(key)}
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-xs">Password algorithm</Label>
            <select
              value={form.password_algorithm}
              onChange={field('password_algorithm')}
              className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none"
            >
              <option value="plaintext">plaintext</option>
              <option value="bcrypt">bcrypt</option>
              <option value="argon2">argon2</option>
            </select>
            <p className="text-xs text-[var(--color-muted)]">Only plaintext is functional for now.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Searchable columns (comma-separated)</Label>
            <Input
              value={form.searchable_columns}
              onChange={field('searchable_columns')}
              placeholder="email, username"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={put.isPending}>
            {put.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  projectId,
  userId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  userId: string
}) {
  const [newPassword, setNewPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!newPassword.trim()) return
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/users/${userId}/password`, { new_password: newPassword })
      toast.success('Password reset')
      onOpenChange(false)
      setNewPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription className="text-amber-400">
            This will directly overwrite the password column.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 mt-2">
          <Label className="text-xs">New password</Label>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !newPassword.trim()}>
            {loading ? 'Resetting...' : 'Reset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UserDetailsModal({
  open,
  onOpenChange,
  row,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  row: Record<string, unknown> | null
}) {
  if (!row) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>User details</DialogTitle></DialogHeader>
        <div className="mt-2 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {Object.entries(row).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-sm">
              <span className="font-mono text-xs text-[var(--color-muted)] w-32 shrink-0 pt-0.5">{k}</span>
              <span className="font-mono text-xs text-[var(--color-fg)] break-all">
                {v === null ? <span className="text-[var(--color-muted)] italic">null</span> : String(v)}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function UsersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)
  const [configOpen, setConfigOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<Record<string, unknown> | null>(null)
  const [resetTarget, setResetTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: config, isLoading: configLoading, error: configError } = useUserConfig(id)
  const { data: users, isLoading: usersLoading } = useProjectUsers(id, debouncedQ, page, PAGE_SIZE)

  const hasConfig = !!config && !configError

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 300)
  }, [q])

  const idCol = config?.id_column ?? 'id'
  const bannedCol = config?.banned_column
  const pwCol = config?.password_column

  async function handleBan(userId: string) {
    try {
      await api.post(`/projects/${id}/users/${userId}/ban`)
      toast.success('User banned')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleUnban(userId: string) {
    try {
      await api.post(`/projects/${id}/users/${userId}/unban`)
      toast.success('User unbanned')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await api.delete(`/projects/${id}/users/${deleteTarget}`)
    toast.success('User deleted')
  }

  if (configLoading) {
    return <div className="text-sm text-[var(--color-muted)]">Loading...</div>
  }

  if (!hasConfig) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="User management is not configured"
          description="Tell miransas which table stores users and which columns to use."
          action={
            <Button onClick={() => setConfigOpen(true)}>Configure</Button>
          }
        />
        <UserConfigDialog
          open={configOpen}
          onOpenChange={setConfigOpen}
          projectId={id}
          initial={null}
        />
      </>
    )
  }

  const columns = users?.columns ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            className="pl-8"
            placeholder="Search users..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="md">
              <Download size={13} className="mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => window.open(`/api/proxy/projects/${id}/users/export?format=csv`)}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/api/proxy/projects/${id}/users/export?format=json`)}>
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" onClick={() => setConfigOpen(true)}>
          <Settings size={15} />
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={users?.rows ?? []}
        loading={usersLoading}
        actions={(row) => {
          const userId = String(row[idCol] ?? '')
          const isBanned = bannedCol ? Boolean(row[bannedCol]) : false

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-white/10 text-[var(--color-muted)]">
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDetailRow(row)}>
                  <Eye size={13} className="mr-2" /> View details
                </DropdownMenuItem>
                {bannedCol && !isBanned && (
                  <DropdownMenuItem onClick={() => handleBan(userId)}>
                    <Ban size={13} className="mr-2" /> Ban
                  </DropdownMenuItem>
                )}
                {bannedCol && isBanned && (
                  <DropdownMenuItem onClick={() => handleUnban(userId)}>
                    Unban
                  </DropdownMenuItem>
                )}
                {pwCol && (
                  <DropdownMenuItem onClick={() => setResetTarget(userId)}>
                    <Key size={13} className="mr-2" /> Reset password
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400"
                  onClick={() => setDeleteTarget(userId)}
                >
                  <Trash2 size={13} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }}
      />

      {users && users.total > PAGE_SIZE && (
        <div className="flex justify-end">
          <Pagination page={page} total={users.total} pageSize={PAGE_SIZE} onChange={setPage} />
        </div>
      )}

      <UserConfigDialog open={configOpen} onOpenChange={setConfigOpen} projectId={id} initial={config} />
      <UserDetailsModal open={!!detailRow} onOpenChange={(o) => { if (!o) setDetailRow(null) }} row={detailRow} />

      {resetTarget && (
        <ResetPasswordDialog
          open
          onOpenChange={(o) => { if (!o) setResetTarget(null) }}
          projectId={id}
          userId={resetTarget}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete user"
        description="This user will be permanently deleted."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
      />
    </div>
  )
}
