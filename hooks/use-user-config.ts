import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { qk } from '@/lib/query-keys'
import type { ProjectUserConfig } from '@/types/api'

export function useUserConfig(projectId: string) {
  return useQuery({
    queryKey: qk.userConfig(projectId),
    queryFn: () => api.get<ProjectUserConfig>(`/projects/${projectId}/user-config`),
    enabled: !!projectId,
    retry: false,
  })
}

export function usePutUserConfig(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<ProjectUserConfig>) =>
      api.put<ProjectUserConfig>(`/projects/${projectId}/user-config`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.userConfig(projectId) }),
  })
}
