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

export type TableInfo = {
  schema: string
  name: string
  table_type: string
}

export type ColumnInfo = {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
  character_maximum_length: number | null
  ordinal_position: number
}

export type ConstraintInfo = {
  constraint_name: string
  constraint_type: 'PRIMARY KEY' | 'UNIQUE' | 'FOREIGN KEY' | 'CHECK' | string
  column_names: string | null
  foreign_table: string | null
  foreign_columns: string | null
  check_clause: string | null
}

export type IndexInfo = {
  index_name: string
  column_names: string
  is_unique: boolean
  index_method: string
}

export type TableStructure = {
  schema: string
  table: string
  columns: ColumnInfo[]
  constraints: ConstraintInfo[]
  indexes: IndexInfo[]
}

export type TableDataResponse = {
  columns: string[]
  rows: Record<string, unknown>[]
  total: number
  page: number
  page_size: number
}

export type QueryResult = {
  columns: string[]
  rows: Record<string, unknown>[]
  rows_affected: number | null
  message: string
}

export type SavedQuery = {
  id: string
  project_id: string
  name: string
  sql: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type QueryHistoryEntry = {
  id: string
  project_id: string
  sql: string
  duration_ms: number
  rows_affected: number | null
  success: boolean
  error_message: string | null
  executed_at: string
}

export type QueryHistoryResponse = {
  rows: QueryHistoryEntry[]
  total: number
  page: number
  page_size: number
}

export type ProjectUserConfig = {
  project_id: string
  users_table: string
  id_column: string
  email_column: string | null
  username_column: string | null
  password_column: string | null
  banned_column: string | null
  password_algorithm: string
  searchable_columns: string[]
  created_at: string
  updated_at: string
}

export type SecretMetadata = {
  id: string
  project_id: string | null
  name: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type SecretWithValue = {
  id: string
  name: string
  value: string
  notes: string | null
  project_id: string | null
}
