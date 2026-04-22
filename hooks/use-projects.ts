import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import type { Project } from '@/types/api'

export function useProjects(initialData?: Project[]) {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => apiFetch<Project[]>('/projects'),
    initialData,
  })
}
