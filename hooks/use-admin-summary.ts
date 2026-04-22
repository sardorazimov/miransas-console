import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import type { AdminSummary } from '@/types/api'

export function useAdminSummary(initialData?: AdminSummary) {
  return useQuery({
    queryKey: queryKeys.adminSummary,
    queryFn: () => apiFetch<AdminSummary>('/admin/summary'),
    initialData,
  })
}
