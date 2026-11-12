import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import SessionProviderWrapper from '@/components/dashboard/SessionProvider'
import { v8FontVars } from '@/lib/v8/fonts'
import '@/styles/pages/(dashboard)/theme.scss'
import '@/styles/pages/(dashboard)/layout.scss'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <SessionProviderWrapper session={session}>
      <div className={`dash-v8 dashboard-shell ${v8FontVars}`}>
        <DashboardSidebar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </SessionProviderWrapper>
  )
}
