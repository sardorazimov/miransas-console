import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { SavedQuery } from '@/types/api'

export function useSavedQueries(projectId: string) {
  return useQuery({
    queryKey: qk.savedQueries(projectId),
    queryFn: () => api.get<SavedQuery[]>(`/projects/${projectId}/saved-queries`),
    enabled: !!projectId,
  })
}

export function useCreateSavedQuery(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; sql: string; notes?: string }) =>
      api.post<SavedQuery>(`/projects/${projectId}/saved-queries`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.savedQueries(projectId) }),
  })
}

export function useUpdateSavedQuery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; sql?: string; notes?: string }) =>
      api.put<SavedQuery>(`/saved-queries/${id}`, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.savedQueries(data.project_id) })
      qc.invalidateQueries({ queryKey: qk.savedQuery(data.id) })
    },
  })
}

export function useDeleteSavedQuery(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/saved-queries/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.savedQueries(projectId) }),
  })
}
