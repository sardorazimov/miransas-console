import { serverFetch } from '@/lib/server-api'
import { ProjectsClient } from './projects-client'
import type { Project } from '@/types/api'

export default async function ProjectsPage() {
  const projects = await serverFetch<Project[]>('/projects')

  return <ProjectsClient initialData={projects} />
}
