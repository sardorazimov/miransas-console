import { requireAuth } from '@/lib/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { Topbar } from '@/components/topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1400px] px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
