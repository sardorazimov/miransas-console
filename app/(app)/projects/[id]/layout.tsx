import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/server-api'
import type { Project } from '@/types/api'
import { ProjectTabs } from './project-tabs'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let project: Project
  try {
    project = await serverFetch<Project>(`/projects/${id}`)
  } catch {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">{project.name}</h1>
        {project.description && (
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{project.description}</p>
        )}
        <div className="mt-2 flex gap-3 text-xs font-mono text-[var(--color-fg-muted)]">
          <span>schema: {project.schema_name}</span>
          {project.repository_url && (
            <a
              href={project.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {project.repository_url}
            </a>
          )}
        </div>
      </div>
      <ProjectTabs projectId={id}>{children}</ProjectTabs>
    </div>
  )
}
