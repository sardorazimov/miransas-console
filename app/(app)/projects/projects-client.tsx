'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, FolderPlus, AlertCircle } from 'lucide-react'
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
  name: z.string().min(1, 'Project name is required'),
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
      toast.success('Project created successfully')
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
          <h1 className="text-xl font-semibold text-white">Projects</h1>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            {list.length} {list.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <Button 
          size="md"  
          onClick={() => setOpen(true)} 
          className="bg-[#8CFF2E] text-[#050505] hover:bg-[#7ce027] hover:shadow-[0_0_15px_rgba(140,255,46,0.3)] transition-all"
        >
          <Plus size={16} className="mr-1" />
          New project
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#050505] overflow-hidden shadow-sm">
        {/* Header row */}
        <div
          className="grid h-10 items-center border-b border-white/10 bg-white/[0.02] px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]"
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
              className="grid items-center px-4 border-b border-white/10 last:border-0 hover:bg-white/[0.04] transition-colors min-h-[52px] py-2"
              style={{ gridTemplateColumns: '2fr 1.5fr 1fr auto' }}
            >
              <div className="min-w-0 pr-4">
                <div className="text-sm font-medium text-white truncate">
                  {project.name}
                </div>
                {project.description && (
                  <div className="text-xs text-[var(--color-muted)] truncate mt-0.5">
                    {project.description}
                  </div>
                )}
              </div>
              <div>
                <span className="font-mono text-[11px] text-[var(--color-fg-muted)] bg-white/5 border border-white/10 rounded-md px-2 py-1 inline-block">
                  {project.schema_name}
                </span>
              </div>
              <div className="text-sm text-[var(--color-muted)] tabular-nums">
                {relativeTime(project.created_at)}
              </div>
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" className="hover:bg-white/10 text-[var(--color-fg-muted)] hover:text-white transition-colors" disabled>
                  Open
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
              <FolderPlus size={28} className="text-[var(--color-muted)]" />
            </div>
            <p className="text-base font-medium text-white">No projects yet</p>
            <p className="text-sm text-[var(--color-muted)] mt-1.5 mb-6 max-w-sm">
              Create your first project to start organizing your databases and deployments.
            </p>
            <Button 
              size="md" 
              onClick={() => setOpen(true)}
              className="bg-[#8CFF2E] text-[#050505] hover:bg-[#7ce027] transition-colors"
            >
              <Plus size={16} className="mr-1" />
              Create Project
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#050505] border border-white/10 shadow-2xl p-0 gap-0 overflow-hidden">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">New Project</DialogTitle>
              <DialogDescription className="text-sm text-[var(--color-muted)] mt-1.5">
                Creates a new Postgres schema and isolated environment for your project.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 pt-2 flex flex-col space-y-5">
              
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-xs font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
                  Project Name <span className="text-[#8CFF2E]">*</span>
                </Label>
                <Input 
                  id="name" 
                  {...register('name')} 
                  placeholder="e.g. production-api" 
                  autoFocus 
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-[#8CFF2E] focus-visible:border-[#8CFF2E] transition-all ${errors.name ? 'border-red-500/50 focus-visible:ring-red-500' : ''}`}
                />
                {errors.name && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400 mt-0.5">
                    <AlertCircle size={12} />
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Description Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="text-xs font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
                  Description
                </Label>
                <Input 
                  id="description" 
                  {...register('description')} 
                  placeholder="What is this project for?" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-[#8CFF2E] focus-visible:border-[#8CFF2E] transition-all"
                />
              </div>

              {/* Repo URL Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="repository_url" className="text-xs font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
                  Repository URL
                </Label>
                <Input
                  id="repository_url"
                  {...register('repository_url')}
                  placeholder="https://github.com/username/repo"
                  className={`bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-[#8CFF2E] focus-visible:border-[#8CFF2E] transition-all ${errors.repository_url ? 'border-red-500/50 focus-visible:ring-red-500' : ''}`}
                />
                {errors.repository_url && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400 mt-0.5">
                    <AlertCircle size={12} />
                    {errors.repository_url.message}
                  </span>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 pt-4 bg-white/[0.02] border-t border-white/10 mt-2">
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOpen(false)}
                  className="text-[var(--color-muted)] hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#8CFF2E] text-[#050505] hover:bg-[#7ce027] font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}