export const queryKeys = {
  adminSummary: ['admin', 'summary'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
}
