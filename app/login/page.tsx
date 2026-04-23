'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error?.message || 'Invalid password')
        return
      }
      router.push('/dashboard')
    } catch {
      toast.error('Network error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-[340px]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="mb-6">
            <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">
              miransas console
            </h1>
            <p className="text-xs text-[var(--color-muted)] mt-1">Internal dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-[var(--color-fg-muted)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                placeholder="Enter password"
                {...register('password')}
              />
              {errors.password && (
                <span className="text-xs text-[var(--color-danger)]">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 w-full rounded-md bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-4">
          Signing in will create a session for 24 hours.
        </p>
      </div>
    </div>
  )
}
