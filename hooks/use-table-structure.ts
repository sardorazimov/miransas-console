import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { TableStructure } from '@/types/api'

export function useTableStructure(projectId: string, table: string) {
  return useQuery({
    queryKey: qk.tableStructure(projectId, table),
    queryFn: () => api.get<TableStructure>(`/projects/${projectId}/schema/tables/${table}`),
    enabled: !!projectId && !!table,
  })
}
