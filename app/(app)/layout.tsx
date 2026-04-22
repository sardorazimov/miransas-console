import { requireAuth } from '@/lib/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { Topbar } from '@/components/topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
