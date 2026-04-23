'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Terminal, Lock, AlertCircle } from 'lucide-react'
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
      toast.error('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden selection:bg-[#8CFF2E] selection:text-black">
      
      {/* Arka plan siber/neon aura efekti */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8CFF2E]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[360px] relative z-10 px-4">
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          
          {/* Üst Kısım / Logo Alanı */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(140,255,46,0.1)]">
              <Terminal size={24} className="text-[#8CFF2E]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
              miransas_console
            </h1>
            <p className="text-xs text-white/50 mt-2 font-mono uppercase tracking-widest">
              Secure Access Gateway
            </p>
          </div>

          {/* Form Alanı */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={12} />
                Access Key
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  placeholder="Enter your password..."
                  {...register('password')}
                  className={`bg-[#050505] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-[#8CFF2E] focus-visible:border-[#8CFF2E] transition-all h-10 w-full px-3 ${errors.password ? 'border-red-500/50 focus-visible:ring-red-500' : ''}`}
                />
              </div>
              {errors.password && (
                <span className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full rounded-lg bg-[#8CFF2E] text-[#050505] text-sm font-bold hover:bg-[#7ce027] hover:shadow-[0_0_20px_rgba(140,255,46,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Initialize Session'
              )}
            </button>
          </form>
        </div>

        {/* Alt Bilgi */}
        <p className="text-center text-[11px] text-white/30 font-mono mt-6 uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          Session duration: 24H
        </p>
      </div>
    </div>
  )
}