'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Table2 } from 'lucide-react'
import { useTables } from '@/hooks/use-tables'
import { DataTable } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'

export default function TablesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: tables, isLoading, error } = useTables(id)

  if (isLoading) {
    return <DataTable columns={['schema', 'name', 'type']} rows={[]} loading />
  }

  if (error) {
    return <DataTable columns={['schema', 'name', 'type']} rows={[]} error={error.message} />
  }

  if (!tables || tables.length === 0) {
    return (
      <EmptyState
        icon={Table2}
        title="No tables yet"
        description="Create one in the Schema tab."
      />
    )
  }

  return (
    <DataTable
      columns={['schema', 'name', 'table_type']}
      rows={tables as Record<string, unknown>[]}
      actions={(row) => (
        <button
          onClick={() =>
            router.push(`/projects/${id}/tables/${row.name as string}`)
          }
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          Open
        </button>
      )}
    />
  )
}
