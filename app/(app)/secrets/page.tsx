'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Eye, EyeOff, Copy, KeyRound, Trash2, MoreHorizontal } from 'lucide-react'
import { useSecrets, useCreateSecret, useDeleteSecret, useRevealSecret } from '@/hooks/use-secrets'
import { useProjects } from '@/hooks/use-projects'
import type { SecretWithValue } from '@/types/api'
import { DataTable } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
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

function RevealModal({
  open,
  onOpenChange,
  revealed,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  revealed: SecretWithValue | null
}) {
  async function copyValue() {
    if (!revealed) return
    await navigator.clipboard.writeText(revealed.value)
    toast.success('Copied to clipboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader>
          <DialogTitle>Secret value</DialogTitle>
          <DialogDescription className="text-amber-400">
            Keep this value private. This dialog will clear on close.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3">
          {revealed ? (
            <div className="relative">
              <textarea
                readOnly
                value={revealed.value}
                className="w-full h-24 font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-fg)] px-3 py-2 outline-none resize-none"
              />
              <Button
                size="sm"
                variant="secondary"
                className="mt-2 w-full"
                onClick={copyValue}
              >
                <Copy size={13} className="mr-1.5" /> Copy
              </Button>
            </div>
          ) : (
            <div className="text-sm text-[var(--color-muted)]">Loading...</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateSecretDialog({
  open,
  onOpenChange,
  projectOptions,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectOptions: { id: string; name: string }[]
}) {
  const create = useCreateSecret()
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [projectId, setProjectId] = useState('')
  const [show, setShow] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !value.trim()) return
    try {
      await create.mutateAsync({
        name,
        value,
        notes: notes || undefined,
        project_id: projectId || null,
      })
      toast.success('Secret created')
      onOpenChange(false)
      setName('')
      setValue('')
      setNotes('')
      setProjectId('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>New secret</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="MY_SECRET" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Value *</Label>
            <div className="relative">
              <Input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="secret value"
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
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What is this secret for?" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Project (optional)</Label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none"
            >
              <option value="">No project</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending || !name.trim() || !value.trim()}>
            {create.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d < 1) return 'today'
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

export default function SecretsPage() {
  const { data: secrets, isLoading } = useSecrets()
  const { data: projects } = useProjects()
  const deleteSecret = useDeleteSecret()
  const revealSecret = useRevealSecret()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<SecretWithValue | null>(null)
  const [revealOpen, setRevealOpen] = useState(false)

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p.name]))
  const projectOptions = (projects ?? []).map((p) => ({ id: p.id, name: p.name }))

  async function handleReveal(id: string) {
    try {
      const res = await revealSecret.mutateAsync(id)
      setRevealed(res)
      setRevealOpen(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reveal')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteSecret.mutateAsync(deleteTarget)
    toast.success('Secret deleted')
  }

  const rows = (secrets ?? []).map((s) => ({
    ...s,
    project: s.project_id ? (projectMap.get(s.project_id) ?? s.project_id) : '—',
    created: relativeTime(s.created_at),
  })) as Record<string, unknown>[]

  if (isLoading) {
    return <DataTable columns={['name', 'project', 'notes', 'created']} rows={[]} loading />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Secrets</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={14} className="mr-1" /> New secret
        </Button>
      </div>

      {!rows.length ? (
        <EmptyState
          icon={KeyRound}
          title="No secrets yet"
          description="Store API keys, passwords, and other sensitive values."
          action={<Button onClick={() => setCreateOpen(true)}><Plus size={14} className="mr-1" /> New secret</Button>}
        />
      ) : (
        <DataTable
          columns={['name', 'project', 'notes', 'created']}
          rows={rows}
          actions={(row) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-white/10 text-[var(--color-muted)]">
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleReveal(row.id as string)}>
                  <Eye size={13} className="mr-2" /> Reveal value
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400"
                  onClick={() => setDeleteTarget(row.id as string)}
                >
                  <Trash2 size={13} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      <CreateSecretDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectOptions={projectOptions}
      />

      <RevealModal
        open={revealOpen}
        onOpenChange={(o) => {
          setRevealOpen(o)
          if (!o) setRevealed(null)
        }}
        revealed={revealed}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete secret"
        description="This secret will be permanently deleted."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
      />
    </div>
  )
}
