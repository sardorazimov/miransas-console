export const queryKeys = {
  adminSummary: ['admin', 'summary'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
}

export const qk = {
  adminSummary: ['admin', 'summary'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['project', id] as const,
  tables: (pid: string) => ['tables', pid] as const,
  tableStructure: (pid: string, t: string) => ['tableStructure', pid, t] as const,
  tableData: (pid: string, t: string, p: number, l: number) => ['tableData', pid, t, p, l] as const,
  queryHistory: (pid: string, f: unknown) => ['queryHistory', pid, f] as const,
  savedQueries: (pid: string) => ['savedQueries', pid] as const,
  savedQuery: (id: string) => ['savedQuery', id] as const,
  userConfig: (pid: string) => ['userConfig', pid] as const,
  projectUsers: (pid: string, q: string, p: number) => ['projectUsers', pid, q, p] as const,
  secrets: () => ['secrets'] as const,
}
