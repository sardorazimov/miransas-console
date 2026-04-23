'use client'

import { use, useState } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Table2,
} from 'lucide-react'
import { useTables } from '@/hooks/use-tables'
import { useTableStructure } from '@/hooks/use-table-structure'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/query-keys'
import type { ColumnInfo, ConstraintInfo, IndexInfo } from '@/types/api'
import { DataTable } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { cn } from '@/lib/utils'

const COMMON_TYPES = [
  'TEXT', 'VARCHAR(255)', 'INTEGER', 'BIGINT', 'SERIAL', 'BIGSERIAL',
  'NUMERIC(10,2)', 'BOOLEAN', 'UUID', 'JSON', 'JSONB', 'TIMESTAMPTZ',
  'TIMESTAMP', 'DATE', 'BYTEA',
]

interface ColumnDef {
  name: string
  type: string
  primary_key: boolean
  nullable: boolean
  unique: boolean
  default_value: string
}

function newColDef(): ColumnDef {
  return { name: '', type: 'TEXT', primary_key: false, nullable: true, unique: false, default_value: '' }
}

function CreateTableDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [cols, setCols] = useState<ColumnDef[]>([newColDef()])
  const [loading, setLoading] = useState(false)

  function updateCol(i: number, patch: Partial<ColumnDef>) {
    setCols((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }

  async function handleSubmit() {
    if (!name.trim() || cols.every((c) => !c.name.trim())) return
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/schema/tables`, {
        name,
        columns: cols.filter((c) => c.name.trim()).map((c) => ({
          name: c.name,
          type: c.type,
          primary_key: c.primary_key,
          nullable: c.nullable,
          unique: c.unique,
          default_value: c.default_value || null,
        })),
        if_not_exists: false,
      })
      toast.success('Table created')
      onSuccess()
      onOpenChange(false)
      setName('')
      setCols([newColDef()])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] p-5">
        <DialogHeader>
          <DialogTitle>Create table</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Table name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my_table" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Columns</Label>
            <div className="space-y-1.5">
              {cols.map((col, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    className="flex-1"
                    placeholder="column_name"
                    value={col.name}
                    onChange={(e) => updateCol(i, { name: e.target.value })}
                  />
                  <select
                    value={col.type}
                    onChange={(e) => updateCol(i, { type: e.target.value })}
                    className="h-9 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-xs text-[var(--color-fg)] px-2 outline-none"
                  >
                    {COMMON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-[var(--color-muted)] cursor-pointer">
                    <input type="checkbox" checked={col.primary_key} onChange={(e) => updateCol(i, { primary_key: e.target.checked })} className="accent-[var(--color-accent)]" />
                    PK
                  </label>
                  <label className="flex items-center gap-1 text-xs text-[var(--color-muted)] cursor-pointer">
                    <input type="checkbox" checked={col.nullable} onChange={(e) => updateCol(i, { nullable: e.target.checked })} className="accent-[var(--color-accent)]" />
                    Null
                  </label>
                  <label className="flex items-center gap-1 text-xs text-[var(--color-muted)] cursor-pointer">
                    <input type="checkbox" checked={col.unique} onChange={(e) => updateCol(i, { unique: e.target.checked })} className="accent-[var(--color-accent)]" />
                    Uniq
                  </label>
                  {cols.length > 1 && (
                    <button
                      onClick={() => setCols((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-[var(--color-muted)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCols((prev) => [...prev, newColDef()])}
              >
                <Plus size={12} className="mr-1" /> Add column
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddColumnDialog({
  open,
  onOpenChange,
  projectId,
  table,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  table: string
  onSuccess: () => void
}) {
  const [col, setCol] = useState<ColumnDef>(newColDef())
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!col.name.trim()) return
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/schema/tables/${table}/columns`, {
        column: {
          name: col.name,
          type: col.type,
          primary_key: col.primary_key,
          nullable: col.nullable,
          unique: col.unique,
          default_value: col.default_value || null,
        },
      })
      toast.success('Column added')
      onSuccess()
      onOpenChange(false)
      setCol(newColDef())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>Add column</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={col.name} onChange={(e) => setCol((c) => ({ ...c, name: e.target.value }))} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <select
              value={col.type}
              onChange={(e) => setCol((c) => ({ ...c, type: e.target.value }))}
              className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none"
            >
              {COMMON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
              <input type="checkbox" checked={col.nullable} onChange={(e) => setCol((c) => ({ ...c, nullable: e.target.checked }))} className="accent-[var(--color-accent)]" />
              Nullable
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
              <input type="checkbox" checked={col.unique} onChange={(e) => setCol((c) => ({ ...c, unique: e.target.checked }))} className="accent-[var(--color-accent)]" />
              Unique
            </label>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Default (optional)</Label>
            <Input value={col.default_value} onChange={(e) => setCol((c) => ({ ...c, default_value: e.target.value }))} placeholder="NULL" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !col.name.trim()}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddFKDialog({
  open,
  onOpenChange,
  projectId,
  table,
  columns,
  tables,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  table: string
  columns: ColumnInfo[]
  tables: string[]
  onSuccess: () => void
}) {
  const [constraintName, setConstraintName] = useState('')
  const [column, setColumn] = useState(columns[0]?.column_name ?? '')
  const [refTable, setRefTable] = useState('')
  const [refColumn, setRefColumn] = useState('')
  const [onDelete, setOnDelete] = useState('NO ACTION')
  const [onUpdate, setOnUpdate] = useState('NO ACTION')
  const [loading, setLoading] = useState(false)

  const actions = ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION']

  async function handleSubmit() {
    if (!constraintName.trim() || !column || !refTable || !refColumn) return
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/schema/tables/${table}/foreign-keys`, {
        constraint_name: constraintName,
        column,
        references_table: refTable,
        references_column: refColumn,
        on_delete: onDelete,
        on_update: onUpdate,
      })
      toast.success('Foreign key added')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>Add foreign key</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Constraint name</Label>
            <Input value={constraintName} onChange={(e) => setConstraintName(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Column</Label>
              <select value={column} onChange={(e) => setColumn(e.target.value)} className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none">
                {columns.map((c) => <option key={c.column_name} value={c.column_name}>{c.column_name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">References table</Label>
              <select value={refTable} onChange={(e) => setRefTable(e.target.value)} className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none">
                <option value="">Select...</option>
                {tables.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">References column</Label>
              <Input value={refColumn} onChange={(e) => setRefColumn(e.target.value)} placeholder="id" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">On delete</Label>
              <select value={onDelete} onChange={(e) => setOnDelete(e.target.value)} className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none">
                {actions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">On update</Label>
              <select value={onUpdate} onChange={(e) => setOnUpdate(e.target.value)} className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none">
                {actions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddCheckDialog({
  open,
  onOpenChange,
  projectId,
  table,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  table: string
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [expr, setExpr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !expr.trim()) return
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/schema/tables/${table}/check-constraints`, {
        constraint_name: name,
        expression: expr,
      })
      toast.success('Check constraint added')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>Add check constraint</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Constraint name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expression</Label>
            <textarea
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="age > 0"
              className="h-20 w-full font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-fg)] px-3 py-2 outline-none resize-none placeholder:text-[var(--color-muted)]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateIndexDialog({
  open,
  onOpenChange,
  projectId,
  table,
  columns,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  projectId: string
  table: string
  columns: ColumnInfo[]
  onSuccess: () => void
}) {
  const [indexName, setIndexName] = useState('')
  const [selectedCols, setSelectedCols] = useState<string[]>([])
  const [unique, setUnique] = useState(false)
  const [method, setMethod] = useState('BTREE')
  const [loading, setLoading] = useState(false)

  function toggleCol(col: string) {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  async function handleSubmit() {
    if (!indexName.trim() || selectedCols.length === 0) return
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/schema/tables/${table}/indexes`, {
        index_name: indexName,
        columns: selectedCols,
        unique,
        method,
      })
      toast.success('Index created')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>Create index</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Index name</Label>
            <Input value={indexName} onChange={(e) => setIndexName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Columns</Label>
            <div className="flex flex-wrap gap-2">
              {columns.map((c) => (
                <label key={c.column_name} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(c.column_name)}
                    onChange={() => toggleCol(c.column_name)}
                    className="accent-[var(--color-accent)]"
                  />
                  <span className="font-mono text-xs">{c.column_name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer">
              <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="accent-[var(--color-accent)]" />
              Unique
            </label>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Method</Label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-9 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-sm text-[var(--color-fg)] px-2 outline-none">
                {['BTREE', 'HASH', 'GIN', 'GIST', 'BRIN'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !indexName.trim() || selectedCols.length === 0}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RenameDialog({
  open,
  onOpenChange,
  title,
  label,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  label: string
  initial: string
  onSubmit: (v: string) => Promise<void>
}) {
  const [value, setValue] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!value.trim()) return
    setLoading(true)
    try {
      await onSubmit(value)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-1.5 mt-2">
          <Label className="text-xs">{label}</Label>
          <Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !value.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChangeTypeDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  initial: string
  onSubmit: (v: string) => Promise<void>
}) {
  const [value, setValue] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!value.trim()) return
    setLoading(true)
    try {
      await onSubmit(value)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5">
        <DialogHeader><DialogTitle>Change column type</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus list="col-types" />
            <datalist id="col-types">
              {COMMON_TYPES.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Changing...' : 'Change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type SchemaDialog =
  | { type: 'addCol' }
  | { type: 'addFK' }
  | { type: 'addCheck' }
  | { type: 'createIndex' }
  | { type: 'renameTable' }
  | { type: 'renameCol'; col: ColumnInfo }
  | { type: 'changeType'; col: ColumnInfo }
  | { type: 'dropTable' }
  | { type: 'dropCol'; col: ColumnInfo }
  | { type: 'dropConstraint'; constraint: ConstraintInfo }
  | { type: 'dropIndex'; index: IndexInfo }

export default function SchemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const { data: tables, isLoading: tablesLoading } = useTables(id)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [structTab, setStructTab] = useState('columns')
  const [createTableOpen, setCreateTableOpen] = useState(false)
  const [dialog, setDialog] = useState<SchemaDialog | null>(null)

  const { data: structure, isLoading: structLoading } = useTableStructure(
    id,
    selectedTable ?? ''
  )

  function invalidate() {
    qc.invalidateQueries({ queryKey: qk.tables(id) })
    if (selectedTable) {
      qc.invalidateQueries({ queryKey: qk.tableStructure(id, selectedTable) })
    }
  }

  async function dropTable() {
    if (!selectedTable) return
    await api.delete(`/projects/${id}/schema/tables/${selectedTable}?cascade=true`)
    toast.success('Table dropped')
    setSelectedTable(null)
    invalidate()
  }

  async function dropConstraint(name: string) {
    await api.delete(`/projects/${id}/schema/tables/${selectedTable}/constraints/${name}`)
    toast.success('Constraint dropped')
    invalidate()
  }

  async function dropIndex(name: string) {
    await api.delete(`/projects/${id}/schema/indexes/${name}`)
    toast.success('Index dropped')
    invalidate()
  }

  async function dropColumn(col: string) {
    await api.delete(
      `/projects/${id}/schema/tables/${selectedTable}/columns/${col}?cascade=true`
    )
    toast.success('Column dropped')
    invalidate()
  }

  const tableNames = (tables ?? []).map((t) => t.name)

  return (
    <div className="flex gap-4 min-h-[500px]">
      {/* Left: table list */}
      <div className="w-[260px] shrink-0 border border-[var(--color-border)] rounded-md overflow-hidden flex flex-col">
        <div className="h-9 px-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-2)]">
          <span className="text-xs font-medium text-[var(--color-muted)]">Tables</span>
          <button
            onClick={() => setCreateTableOpen(true)}
            className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tablesLoading && (
            <div className="p-3 text-xs text-[var(--color-muted)]">Loading...</div>
          )}
          {!tablesLoading && tableNames.length === 0 && (
            <div className="p-3 text-xs text-[var(--color-muted)]">No tables</div>
          )}
          {tableNames.map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTable(t); setStructTab('columns') }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm transition-colors font-mono border-l-2',
                selectedTable === t
                  ? 'bg-[var(--color-surface-2)] border-[var(--color-accent)] text-[var(--color-fg)]'
                  : 'border-transparent text-[var(--color-fg-muted)] hover:bg-white/[0.03] hover:text-[var(--color-fg)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Right: detail */}
      {!selectedTable ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon={Table2} title="Select a table" description="Choose a table from the left to view its structure." />
        </div>
      ) : (
        <div className="flex-1 border border-[var(--color-border)] rounded-md overflow-hidden flex flex-col">
          <div className="h-9 px-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-2)]">
            <span className="font-mono text-sm text-[var(--color-fg)]">{selectedTable}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-white/10 text-[var(--color-muted)]">
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDialog({ type: 'renameTable' })}>
                  <Pencil size={13} className="mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400"
                  onClick={() => setDialog({ type: 'dropTable' })}
                >
                  <Trash2 size={13} className="mr-2" /> Drop table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs value={structTab} onValueChange={setStructTab} className="flex flex-col flex-1">
            <TabsList className="px-3">
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="indexes">Indexes</TabsTrigger>
            </TabsList>

            <div className="flex-1 p-3 overflow-auto">
              <TabsContent value="columns">
                {structLoading ? (
                  <div className="text-xs text-[var(--color-muted)]">Loading...</div>
                ) : (
                  <>
                    <DataTable
                      columns={['column_name', 'data_type', 'is_nullable', 'column_default']}
                      rows={(structure?.columns ?? []) as Record<string, unknown>[]}
                      actions={(row) => (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-white/10 text-[var(--color-muted)]">
                              <MoreHorizontal size={12} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDialog({ type: 'renameCol', col: row as unknown as ColumnInfo })}>
                              <Pencil size={12} className="mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDialog({ type: 'changeType', col: row as unknown as ColumnInfo })}>
                              Change type
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-400"
                              onClick={() => setDialog({ type: 'dropCol', col: row as unknown as ColumnInfo })}
                            >
                              <Trash2 size={12} className="mr-2" /> Drop
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    />
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setDialog({ type: 'addCol' })}>
                        <Plus size={12} className="mr-1" /> Add column
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="constraints">
                {structLoading ? (
                  <div className="text-xs text-[var(--color-muted)]">Loading...</div>
                ) : (
                  <>
                    <DataTable
                      columns={['constraint_name', 'constraint_type', 'column_names']}
                      rows={(structure?.constraints ?? []) as Record<string, unknown>[]}
                      actions={(row) => (
                        <button
                          className="text-xs text-red-400 hover:underline"
                          onClick={() => setDialog({ type: 'dropConstraint', constraint: row as unknown as ConstraintInfo })}
                        >
                          Drop
                        </button>
                      )}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setDialog({ type: 'addFK' })}>
                        <Plus size={12} className="mr-1" /> Add FK
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDialog({ type: 'addCheck' })}>
                        <Plus size={12} className="mr-1" /> Add CHECK
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="indexes">
                {structLoading ? (
                  <div className="text-xs text-[var(--color-muted)]">Loading...</div>
                ) : (
                  <>
                    <DataTable
                      columns={['index_name', 'column_names', 'is_unique', 'index_method']}
                      rows={(structure?.indexes ?? []) as Record<string, unknown>[]}
                      actions={(row) => (
                        <button
                          className="text-xs text-red-400 hover:underline"
                          onClick={() => setDialog({ type: 'dropIndex', index: row as unknown as IndexInfo })}
                        >
                          Drop
                        </button>
                      )}
                    />
                    <div className="mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setDialog({ type: 'createIndex' })}>
                        <Plus size={12} className="mr-1" /> Create index
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}

      {/* Dialogs */}
      <CreateTableDialog
        open={createTableOpen}
        onOpenChange={setCreateTableOpen}
        projectId={id}
        onSuccess={invalidate}
      />

      {dialog?.type === 'addCol' && selectedTable && (
        <AddColumnDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          projectId={id}
          table={selectedTable}
          onSuccess={invalidate}
        />
      )}

      {dialog?.type === 'addFK' && selectedTable && (
        <AddFKDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          projectId={id}
          table={selectedTable}
          columns={structure?.columns ?? []}
          tables={tableNames}
          onSuccess={invalidate}
        />
      )}

      {dialog?.type === 'addCheck' && selectedTable && (
        <AddCheckDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          projectId={id}
          table={selectedTable}
          onSuccess={invalidate}
        />
      )}

      {dialog?.type === 'createIndex' && selectedTable && (
        <CreateIndexDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          projectId={id}
          table={selectedTable}
          columns={structure?.columns ?? []}
          onSuccess={invalidate}
        />
      )}

      {dialog?.type === 'renameTable' && selectedTable && (
        <RenameDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          title="Rename table"
          label="New name"
          initial={selectedTable}
          onSubmit={async (v) => {
            await api.post(`/projects/${id}/schema/tables/${selectedTable}/rename`, { new_name: v })
            toast.success('Table renamed')
            setSelectedTable(v)
            invalidate()
          }}
        />
      )}

      {dialog?.type === 'renameCol' && selectedTable && (
        <RenameDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          title="Rename column"
          label="New name"
          initial={dialog.col.column_name}
          onSubmit={async (v) => {
            await api.post(
              `/projects/${id}/schema/tables/${selectedTable}/columns/${dialog.col.column_name}/rename`,
              { new_name: v }
            )
            toast.success('Column renamed')
            invalidate()
          }}
        />
      )}

      {dialog?.type === 'changeType' && selectedTable && (
        <ChangeTypeDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          initial={dialog.col.data_type}
          onSubmit={async (v) => {
            await api.post(
              `/projects/${id}/schema/tables/${selectedTable}/columns/${dialog.col.column_name}/type`,
              { new_type: v }
            )
            toast.success('Type changed')
            invalidate()
          }}
        />
      )}

      {dialog?.type === 'dropTable' && (
        <ConfirmDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          title={`Drop table "${selectedTable}"?`}
          description="All data will be permanently deleted (CASCADE)."
          confirmLabel="Drop"
          danger
          onConfirm={dropTable}
        />
      )}

      {dialog?.type === 'dropCol' && (
        <ConfirmDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          title={`Drop column "${dialog.col.column_name}"?`}
          description="This column and its data will be permanently deleted."
          confirmLabel="Drop"
          danger
          onConfirm={async () => {
            await dropColumn(dialog.col.column_name)
            setDialog(null)
          }}
        />
      )}

      {dialog?.type === 'dropConstraint' && (
        <ConfirmDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          title={`Drop constraint "${dialog.constraint.constraint_name}"?`}
          confirmLabel="Drop"
          danger
          onConfirm={async () => {
            await dropConstraint(dialog.constraint.constraint_name)
            setDialog(null)
          }}
        />
      )}

      {dialog?.type === 'dropIndex' && (
        <ConfirmDialog
          open
          onOpenChange={(o) => { if (!o) setDialog(null) }}
          title={`Drop index "${dialog.index.index_name}"?`}
          confirmLabel="Drop"
          danger
          onConfirm={async () => {
            await dropIndex(dialog.index.index_name)
            setDialog(null)
          }}
        />
      )}
    </div>
  )
}
