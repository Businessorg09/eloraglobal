import { DashboardProvider } from '@/components/dashboard/DashboardContext'

export default function TreeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      {children}
    </DashboardProvider>
  )
}
