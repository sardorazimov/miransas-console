import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { Project } from '@/types/api'

export function useProject(id: string) {
  return useQuery({
    queryKey: qk.project(id),
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  })
}
