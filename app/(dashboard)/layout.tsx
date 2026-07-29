import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import SessionProviderWrapper from '@/components/dashboard/SessionProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <SessionProviderWrapper session={session}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d0d' }}>
        <DashboardSidebar />
        <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  )
}
