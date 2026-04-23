import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { TableDataResponse } from '@/types/api'

export function useTableData(projectId: string, table: string, page: number, limit: number) {
  return useQuery({
    queryKey: qk.tableData(projectId, table, page, limit),
    queryFn: () =>
      api.get<TableDataResponse>(
        `/projects/${projectId}/tables/${table}?page=${page}&limit=${limit}`
      ),
    enabled: !!projectId && !!table,
  })
}
