import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { SecretMetadata, SecretWithValue } from '@/types/api'

export function useSecrets() {
  return useQuery({
    queryKey: qk.secrets(),
    queryFn: () => api.get<SecretMetadata[]>('/secrets'),
  })
}

export function useCreateSecret() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; value: string; notes?: string; project_id?: string | null }) =>
      api.post<SecretMetadata>('/secrets', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.secrets() }),
  })
}

export function useDeleteSecret() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/secrets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.secrets() }),
  })
}

export function useRevealSecret() {
  return useMutation({
    mutationFn: (id: string) => api.post<SecretWithValue>(`/secrets/${id}/reveal`),
  })
}
