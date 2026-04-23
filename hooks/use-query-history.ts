import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { QueryHistoryResponse } from '@/types/api'

interface QueryHistoryFilter {
  page?: number
  limit?: number
  success?: boolean
}

export function useQueryHistory(projectId: string, filter: QueryHistoryFilter = {}) {
  const params = new URLSearchParams()
  if (filter.page !== undefined) params.set('page', String(filter.page))
  if (filter.limit !== undefined) params.set('limit', String(filter.limit))
  if (filter.success !== undefined) params.set('success', String(filter.success))
  const qs = params.toString()

  return useQuery({
    queryKey: qk.queryHistory(projectId, filter),
    queryFn: () =>
      api.get<QueryHistoryResponse>(
        `/projects/${projectId}/query-history${qs ? `?${qs}` : ''}`
      ),
    enabled: !!projectId,
  })
}
