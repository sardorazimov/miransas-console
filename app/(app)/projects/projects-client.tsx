'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[oklch(0.95_0_0)]">Projects</h2>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New project
        </Button>
      </div>

      <div className="rounded-[6px] border border-[oklch(0.22_0_0)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[oklch(0.22_0_0)] bg-[oklch(0.175_0_0)]">
              <th className="text-left px-4 h-9 font-medium text-[oklch(0.55_0_0)]">Name</th>
              <th className="text-left px-4 h-9 font-medium text-[oklch(0.55_0_0)]">Description</th>
              <th className="text-left px-4 h-9 font-medium text-[oklch(0.55_0_0)]">Schema</th>
              <th className="text-left px-4 h-9 font-medium text-[oklch(0.55_0_0)]">Created</th>
              <th className="px-4 h-9" />
            </tr>
          </thead>
          <tbody>
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-[oklch(0.22_0_0)] last:border-0 hover:bg-[oklch(0.175_0_0)] transition-colors"
                >
                  <td className="px-4 h-9 font-medium text-[oklch(0.95_0_0)]">{project.name}</td>
                  <td className="px-4 h-9 text-[oklch(0.55_0_0)]">
                    {project.description ?? <span className="text-[oklch(0.35_0_0)]">—</span>}
                  </td>
                  <td className="px-4 h-9 font-mono text-xs text-[oklch(0.65_0_0)] tabular-nums">
                    {project.schema_name}
                  </td>
                  <td className="px-4 h-9 text-[oklch(0.55_0_0)] tabular-nums">
                    {relativeTime(project.created_at)}
                  </td>
                  <td className="px-4 h-9">
                    <Button size="sm" variant="outline" disabled>
                      Open
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[oklch(0.55_0_0)]">
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register('name')} placeholder="my-project" />
              {errors.name && (
                <span className="text-xs text-[oklch(0.65_0.2_25)]">{errors.name.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="Optional description" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repository_url">Repository URL</Label>
              <Input
                id="repository_url"
                {...register('repository_url')}
                placeholder="https://github.com/..."
              />
              {errors.repository_url && (
                <span className="text-xs text-[oklch(0.65_0.2_25)]">{errors.repository_url.message}</span>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
