'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Play, Save, Clock, Bookmark, MoreHorizontal, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { qk } from '@/lib/query-keys'
import { useQueryHistory } from '@/hooks/use-query-history'
import {
  useSavedQueries,
  useCreateSavedQuery,
  useUpdateSavedQuery,
  useDeleteSavedQuery,
} from '@/hooks/use-saved-queries'
import type { QueryResult, SavedQuery } from '@/types/api'
import { DataTable } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

export default function SqlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const qc = useQueryClient()

  const [sql, setSql] = useState('SELECT * FROM ')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('history')
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveNotes, setSaveNotes] = useState('')
  const [editTarget, setEditTarget] = useState<SavedQuery | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: history } = useQueryHistory(id, { limit: 20 })
  const { data: savedQueries } = useSavedQueries(id)
  const createSaved = useCreateSavedQuery(id)
  const updateSaved = useUpdateSavedQuery()
  const deleteSaved = useDeleteSavedQuery(id)

  async function runQuery() {
    if (!sql.trim()) return
    setRunning(true)
    setResult(null)
    setQueryError(null)
    try {
      const res = await api.post<QueryResult>(`/projects/${id}/query`, { sql })
      setResult(res)
      qc.invalidateQueries({ queryKey: qk.queryHistory(id, { limit: 20 }) })
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Query failed')
      qc.invalidateQueries({ queryKey: qk.queryHistory(id, { limit: 20 }) })
    } finally {
      setRunning(false)
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        runQuery()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        setSaveName('')
        setSaveNotes('')
        setSaveOpen(true)
      }
    },
    [sql] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  async function handleSave() {
    if (!saveName.trim()) return
    try {
      await createSaved.mutateAsync({ name: saveName, sql, notes: saveNotes || undefined })
      toast.success('Query saved')
      setSaveOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  async function handleEditSave() {
    if (!editTarget || !saveName.trim()) return
    try {
      await updateSaved.mutateAsync({ id: editTarget.id, name: saveName, notes: saveNotes || undefined })
      toast.success('Query updated')
      setEditTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  async function handleDeleteSaved() {
    if (!deleteTarget) return
    await deleteSaved.mutateAsync(deleteTarget)
    toast.success('Query deleted')
  }

  return (
    <div className="grid grid-cols-[1fr_280px] gap-4 h-[calc(100vh-240px)] min-h-[400px]">
      {/* Left: editor + results */}
      <div className="flex flex-col gap-3 min-h-0">
        {/* Editor */}
        <div className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md overflow-hidden flex-1 min-h-[200px]">
          <div className="h-9 px-3 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
            <span className="text-xs text-[var(--color-muted)]">
              {savedQueries && savedQueries.length > 0 && (
                <select
                  className="bg-transparent text-[var(--color-fg-muted)] text-xs outline-none cursor-pointer"
                  defaultValue=""
                  onChange={(e) => {
                    const q = savedQueries.find((s) => s.id === e.target.value)
                    if (q) setSql(q.sql)
                    e.target.value = ''
                  }}
                >
                  <option value="" disabled>Load saved query...</option>
                  {savedQueries.map((q) => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
              )}
              {(!savedQueries || savedQueries.length === 0) && (
                <span>SQL Editor</span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--color-muted)]">
                {navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
              </span>
              <Button
                size="sm"
                onClick={runQuery}
                disabled={running}
                className="bg-[var(--color-accent)] text-[var(--color-accent-fg)] h-7 px-3"
              >
                <Play size={12} className="mr-1" />
                {running ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="flex-1 font-mono text-sm bg-transparent text-[var(--color-fg)] placeholder:text-[var(--color-muted)] p-3 outline-none resize-none"
            placeholder="SELECT * FROM ..."
            spellCheck={false}
          />
        </div>

        {/* Results */}
        <div className="h-[40%] shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md overflow-hidden flex flex-col">
          <div className="h-9 px-3 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
            <span className="text-xs text-[var(--color-muted)]">
              {result && !queryError && (
                <span>
                  {result.rows.length} row{result.rows.length !== 1 ? 's' : ''}
                  {result.rows_affected !== null && ` · ${result.rows_affected} affected`}
                </span>
              )}
              {queryError && <span className="text-red-400">Error</span>}
              {!result && !queryError && <span>Results</span>}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {queryError && (
              <div className="text-sm text-red-400 font-mono p-2">{queryError}</div>
            )}
            {result && !queryError && (
              <DataTable columns={result.columns} rows={result.rows} />
            )}
            {!result && !queryError && (
              <div className="text-xs text-[var(--color-muted)] p-2">Run a query to see results.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md overflow-hidden">
        <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex flex-col h-full">
          <TabsList className="shrink-0">
            <TabsTrigger value="history">
              <Clock size={12} className="mr-1" /> History
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark size={12} className="mr-1" /> Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="flex-1 overflow-y-auto p-2 space-y-1">
            {history?.rows.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSql(entry.sql)}
                className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {entry.success ? (
                    <CheckCircle size={10} className="text-green-400 shrink-0" />
                  ) : (
                    <XCircle size={10} className="text-red-400 shrink-0" />
                  )}
                  <span className="text-[10px] text-[var(--color-muted)]">
                    {entry.duration_ms}ms · {relativeTime(entry.executed_at)}
                  </span>
                </div>
                <div className="font-mono text-xs text-[var(--color-fg-muted)] truncate">
                  {entry.sql.slice(0, 80)}
                </div>
              </button>
            ))}
            {(!history || history.rows.length === 0) && (
              <div className="text-xs text-[var(--color-muted)] p-2">No history yet.</div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-2 border-b border-[var(--color-border)]">
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-xs"
                onClick={() => {
                  setSaveName('')
                  setSaveNotes('')
                  setSaveOpen(true)
                }}
              >
                <Save size={12} className="mr-1" />
                Save current query
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {savedQueries?.map((q) => (
                <div key={q.id} className="flex items-start gap-1 group">
                  <button
                    onClick={() => setSql(q.sql)}
                    className="flex-1 text-left p-2 rounded hover:bg-white/5 transition-colors"
                  >
                    <div className="text-xs font-medium text-[var(--color-fg)] mb-0.5">{q.name}</div>
                    <div className="font-mono text-[10px] text-[var(--color-muted)] truncate">{q.sql.slice(0, 60)}</div>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="mt-2 p-1 rounded text-[var(--color-muted)] hover:bg-white/5 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditTarget(q)
                          setSaveName(q.name)
                          setSaveNotes(q.notes ?? '')
                        }}
                      >
                        <Pencil size={13} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => setDeleteTarget(q.id)}
                      >
                        <Trash2 size={13} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {(!savedQueries || savedQueries.length === 0) && (
                <div className="text-xs text-[var(--color-muted)] p-2">No saved queries.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Save dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="max-w-[480px] p-5">
          <DialogHeader>
            <DialogTitle>Save query</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My query"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                placeholder="What does this query do?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!saveName.trim() || createSaved.isPending}>
              {createSaved.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit saved query dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null) }}>
        <DialogContent className="max-w-[480px] p-5">
          <DialogHeader>
            <DialogTitle>Edit saved query</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={saveNotes} onChange={(e) => setSaveNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={!saveName.trim() || updateSaved.isPending}>
              {updateSaved.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Delete saved query"
        description="This saved query will be permanently deleted."
        confirmLabel="Delete"
        danger
        onConfirm={handleDeleteSaved}
      />
    </div>
  )
}
