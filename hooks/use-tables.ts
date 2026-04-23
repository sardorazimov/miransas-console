import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { TableInfo } from '@/types/api'

export function useTables(projectId: string) {
  return useQuery({
    queryKey: qk.tables(projectId),
    queryFn: () => api.get<TableInfo[]>(`/projects/${projectId}/tables`),
    enabled: !!projectId,
  })
}
