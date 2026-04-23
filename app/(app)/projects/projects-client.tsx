'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, FolderPlus } from 'lucide-react'
import { useProjects } from '@/hooks/use-projects'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Project } from '@/types/api'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const newProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type NewProjectValues = z.infer<typeof newProjectSchema>

interface ProjectsClientProps {
  initialData: Project[]
}

export function ProjectsClient({ initialData }: ProjectsClientProps) {
  const { data: projects } = useProjects(initialData)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewProjectValues>({ resolver: zodResolver(newProjectSchema) })

  async function onSubmit(data: NewProjectValues) {
    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          repository_url: data.repository_url || null,
        }),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      toast.success('Project created')
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    }
  }

  const list = projects ?? initialData

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-fg)]">Projects</h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            {list.length} {list.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
          <Plus size={14} />
          New project
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {/* Header row */}
        <div
          className="grid h-9 items-center border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]"
          style={{ gridTemplateColumns: '2fr 1.5fr 1fr auto' }}
        >
          <span>Name</span>
          <span>Schema</span>
          <span>Created</span>
          <span />
        </div>

        {list.length > 0 ? (
          list.map((project) => (
            <div
              key={project.id}
              className="grid items-center px-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/50 transition-colors min-h-[44px] py-2"
              style={{ gridTemplateColumns: '2fr 1.5fr 1fr auto' }}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--color-fg)] truncate">
                  {project.name}
                </div>
                {project.description && (
                  <div className="text-xs text-[var(--color-muted)] truncate mt-0.5">
                    {project.description}
                  </div>
                )}
              </div>
              <div>
                <span className="font-mono text-xs text-[var(--color-fg-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded px-1.5 py-0.5 inline-block">
                  {project.schema_name}
                </span>
              </div>
              <div className="text-sm text-[var(--color-muted)] tabular-nums">
                {relativeTime(project.created_at)}
              </div>
              <div>
                <Button size="sm" variant="ghost" disabled>
                  Open
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <FolderPlus size={48} className="text-[var(--color-muted)] mb-4 opacity-50" />
            <p className="text-sm font-medium text-[var(--color-fg-muted)]">No projects yet</p>
            <p className="text-xs text-[var(--color-muted)] mt-1 mb-4">
              Create your first project to start organizing your databases
            </p>
            <Button size="sm" variant="primary" onClick={() => setOpen(true)}>
              <Plus size={14} />
              New project
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Creates a new Postgres schema for this project
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-[var(--color-fg-muted)]">
                Name *
              </Label>
              <Input id="name" {...register('name')} placeholder="my-project" autoFocus />
              {errors.name && (
                <span className="text-xs text-[var(--color-danger)]">{errors.name.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-[var(--color-fg-muted)]">
                Description
              </Label>
              <Input id="description" {...register('description')} placeholder="Optional description" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repository_url" className="text-xs font-medium text-[var(--color-fg-muted)]">
                Repository URL
              </Label>
              <Input
                id="repository_url"
                {...register('repository_url')}
                placeholder="https://github.com/..."
              />
              {errors.repository_url && (
                <span className="text-xs text-[var(--color-danger)]">{errors.repository_url.message}</span>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
