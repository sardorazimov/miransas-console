export type Project = {
  id: string
  name: string
  description: string | null
  repository_url: string | null
  schema_name: string
  created_at: string
  updated_at: string
}

export type AdminSummary = {
  project_count: number
  database_count: number
  secret_count: number
  audit_log_count: number
  generated_at: string
}
