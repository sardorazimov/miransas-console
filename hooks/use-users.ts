import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'

export type ProjectUsersResponse = {
  columns: string[]
  rows: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
}

export function useProjectUsers(
  projectId: string,
  q: string,
  page: number,
  limit: number
) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  params.set('page', String(page))
  params.set('limit', String(limit))
  const qs = params.toString()

  return useQuery({
    queryKey: qk.projectUsers(projectId, q, page),
    queryFn: () =>
      api.get<ProjectUsersResponse>(`/projects/${projectId}/users?${qs}`),
    enabled: !!projectId,
  })
}
