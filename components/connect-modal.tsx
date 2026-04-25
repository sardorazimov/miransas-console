'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useConnection, useResetPassword } from '@/hooks/use-connection'

interface ConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
}

function maskPassword(s: string): string {
  return s.replace(/:[^@]+@/, ':****@')
}

interface CodeBlockProps {
  value: string
  field: string
  showCopy?: boolean
  showToggle?: boolean
  showPassword: boolean
  onToggle?: () => void
  copiedField: string | null
  onCopy: (text: string, field: string) => void
  masked?: boolean
}

function CodeBlock({
  value,
  field,
  showCopy = true,
  showToggle = false,
  showPassword,
  onToggle,
  copiedField,
  onCopy,
  masked = false,
}: CodeBlockProps) {
  const display = masked && !showPassword ? maskPassword(value) : value
  const isCopied = copiedField === field

  return (
    <div className="relative group">
      <pre className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-3 font-mono text-xs text-[var(--color-fg)] overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
        {display}
      </pre>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showToggle && onToggle && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center h-6 w-6 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        )}
        {showCopy && (
          <button
            onClick={() => onCopy(value, field)}
            className="flex items-center justify-center h-6 w-6 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
            title="Copy"
          >
            {isCopied ? (
              <Check size={11} className="text-green-400" />
            ) : (
              <Copy size={11} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export function ConnectModal({ open, onOpenChange, projectId, projectName }: ConnectModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const { data, isLoading, isError } = useConnection(projectId, open)
  const resetPassword = useResetPassword(projectId)

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  function handleOpenChange(val: boolean) {
    if (!val) setShowPassword(false)
    onOpenChange(val)
  }

  async function handleReset() {
    await resetPassword.mutateAsync()
    toast.success('New password generated')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[560px] p-5">
          <DialogHeader>
            <DialogTitle>Connect to {projectName}</DialogTitle>
            <DialogDescription>
              Use this connection string to connect from your application.
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center gap-2 py-6 text-sm text-[var(--color-muted)]">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading connection details...
            </div>
          )}

          {isError && !isLoading && (
            <div className="py-4 text-sm text-[var(--color-muted)]">
              Failed to load. Reset the password to generate one.
            </div>
          )}

          {data && !isLoading && (
            <div className="space-y-4 mt-1">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[var(--color-muted)]">Connection string</div>
                <CodeBlock
                  value={data.connection_string}
                  field="connection_string"
                  showToggle
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                  masked
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[var(--color-muted)]">psql command</div>
                <CodeBlock
                  value={data.psql_command}
                  field="psql_command"
                  showPassword={showPassword}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                  masked
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[var(--color-muted)]">.env snippet</div>
                <CodeBlock
                  value={data.env_snippet}
                  field="env_snippet"
                  showPassword={showPassword}
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
              </div>

              <div className="flex items-center justify-between border-t border-[var(--color-border)] mt-5 pt-4">
                <span className="font-mono text-xs text-[var(--color-muted)]">
                  Schema: {data.schema} · Role: {data.role}
                </span>
                <button
                  onClick={() => setConfirmReset(true)}
                  className="text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 px-2 h-7 rounded transition-colors"
                >
                  Reset password
                </button>
              </div>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex justify-end border-t border-[var(--color-border)] mt-5 pt-4">
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 px-2 h-7 rounded transition-colors"
              >
                Reset password
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset password?"
        description="This will break existing connections using the old password."
        confirmLabel="Reset password"
        danger
        onConfirm={handleReset}
      />
    </>
  )
}
