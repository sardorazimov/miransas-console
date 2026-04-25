'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, Plug } from 'lucide-react'
import { useProject } from '@/hooks/use-project'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { qk, queryKeys } from '@/lib/query-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConnectModal } from '@/components/connect-modal'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const { data: project, isLoading } = useProject(id)

  const [connectOpen, setConnectOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  function openRename() {
    setNewName(project?.name ?? '')
    setNewDesc(project?.description ?? '')
    setRenameOpen(true)
  }

  async function handleRename() {
    if (!newName.trim()) return
    setRenaming(true)
    try {
      await api.put(`/projects/${id}`, { name: newName, description: newDesc || null })
      await qc.invalidateQueries({ queryKey: qk.project(id) })
      await qc.invalidateQueries({ queryKey: queryKeys.projects })
      toast.success('Project renamed')
      setRenameOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename')
    } finally {
      setRenaming(false)
    }
  }

  async function handleDelete() {
    await api.delete(`/projects/${id}`)
    await qc.invalidateQueries({ queryKey: queryKeys.projects })
    toast.success('Project deleted')
    router.push('/projects')
  }

  if (isLoading) return <div className="text-sm text-[var(--color-muted)]">Loading...</div>
  if (!project) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-[var(--color-muted)]">Project details and connection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setConnectOpen(true)}>
            <Plug className="h-4 w-4" />
            Connect
          </Button>
        </div>
      </div>

      <ConnectModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        projectId={id}
        projectName={project.name}
      />

    <div className="flex gap-8">
      <div className="flex-1 space-y-4">
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
          <h2 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            Project Info
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-[var(--color-muted)] mb-0.5">Name</div>
              <div className="font-medium text-[var(--color-fg)]">{project.name}</div>
            </div>
            <div>
              <div className="text-xs text-[var(--color-muted)] mb-0.5">Schema</div>
              <div className="font-mono text-xs text-[var(--color-fg-muted)]">
                {project.schema_name}
              </div>
            </div>
            {project.description && (
              <div className="col-span-2">
                <div className="text-xs text-[var(--color-muted)] mb-0.5">Description</div>
                <div className="text-[var(--color-fg)]">{project.description}</div>
              </div>
            )}
            {project.repository_url && (
              <div className="col-span-2">
                <div className="text-xs text-[var(--color-muted)] mb-0.5">Repository</div>
                <a
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-[var(--color-accent)] hover:underline"
                >
                  {project.repository_url}
                </a>
              </div>
            )}
            <div>
              <div className="text-xs text-[var(--color-muted)] mb-0.5">Created</div>
              <div className="text-[var(--color-fg-muted)] text-xs">
                {relativeTime(project.created_at)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--color-muted)] mb-0.5">Updated</div>
              <div className="text-[var(--color-fg-muted)] text-xs">
                {relativeTime(project.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-48 shrink-0">
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <h3 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
            Actions
          </h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={openRename}
              className="flex items-center gap-2 h-8 px-2 rounded text-sm text-[var(--color-fg-muted)] hover:bg-white/5 hover:text-[var(--color-fg)] transition-colors text-left"
            >
              <Pencil size={13} />
              Rename
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 h-8 px-2 rounded text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 size={13} />
              Delete project
            </button>
          </div>
        </div>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="max-w-[480px] p-5">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={renaming || !newName.trim()}>
              {renaming ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project"
        description={`This will permanently delete "${project.name}" and all associated data. This action cannot be undone.`}
        confirmLabel="Delete project"
        danger
        onConfirm={handleDelete}
      />
    </div>
    </div>
  )
}
