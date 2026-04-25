import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ConnectionInfo } from '@/types/api'

export function useConnection(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['connection', projectId],
    queryFn: () => api.get<ConnectionInfo>(`/projects/${projectId}/connection`),
    enabled,
    staleTime: 0,
    refetchOnMount: true,
  })
}

export function useResetPassword(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ConnectionInfo>(`/projects/${projectId}/reset-password`),
    onSuccess: (data) => {
      qc.setQueryData(['connection', projectId], data)
    },
  })
}
