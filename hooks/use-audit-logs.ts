import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { AuditLogsResponse } from '@/types/api'

export type AuditLogsFilter = {
  page: number
  limit: number
  resource_type?: string
  resource_id?: string
}

export function useAuditLogs(filter: AuditLogsFilter) {
  const params = new URLSearchParams()
  params.set('page', String(filter.page))
  params.set('limit', String(filter.limit))
  if (filter.resource_type) params.set('resource_type', filter.resource_type)
  if (filter.resource_id) params.set('resource_id', filter.resource_id)

  return useQuery({
    queryKey: ['auditLogs', filter],
    queryFn: () => api.get<AuditLogsResponse>(`/audit-logs?${params}`),
    staleTime: 10_000,
  })
}
