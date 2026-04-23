'use client'

import { use, useState } from 'react'
import { toast } from 'sonner'
import { Trash2, MoreHorizontal } from 'lucide-react'
import { useTableData } from '@/hooks/use-table-data'
import { useTableStructure } from '@/hooks/use-table-structure'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/query-keys'
import { DataTable } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const PAGE_SIZE = 50

export default function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string; table: string }>
}) {
  const { id, table } = use(params)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null)
  const qc = useQueryClient()

  const { data: structure } = useTableStructure(id, table)
  const { data, isLoading, error } = useTableData(id, table, page, PAGE_SIZE)

  const idColumn =
    structure?.constraints.find((c) => c.constraint_type === 'PRIMARY KEY')?.column_names?.split(',')[0].trim() ??
    (structure?.columns.find((c) => c.column_name === 'id') ? 'id' : null)

  async function handleDelete() {
    if (!deleteTarget || !idColumn) return
    const rowId = deleteTarget[idColumn]
    await api.delete(`/projects/${id}/tables/${table}/${rowId}?pk=${idColumn}`)
    await qc.invalidateQueries({ queryKey: qk.tableData(id, table, page, PAGE_SIZE) })
    toast.success('Row deleted')
  }

  const columns = data?.columns ?? []

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-[var(--color-muted)]">
          <span>
            <span className="font-mono text-[var(--color-fg-muted)]">{table}</span>
          </span>
          {data && (
            <span>{data.total} rows</span>
          )}
          {structure && (
            <span>{structure.columns.length} columns</span>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.rows ?? []}
        loading={isLoading}
        error={error?.message}
        actions={(row) => (
          <TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-white/10 text-[var(--color-muted)] hover:text-[var(--color-fg)]">
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {idColumn ? (
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400"
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 size={13} className="mr-2" />
                    Delete row
                  </DropdownMenuItem>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-2 py-1.5 text-sm text-[var(--color-muted)] opacity-50 cursor-not-allowed flex items-center gap-2">
                        <Trash2 size={13} />
                        Delete row
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>No id column</TooltipContent>
                  </Tooltip>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        )}
      />

      {data && data.total > PAGE_SIZE && (
        <div className="flex justify-end">
          <Pagination
            page={page}
            total={data.total}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete row"
        description="This row will be permanently deleted."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
      />
    </div>
  )
}
