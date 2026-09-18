import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import CronClientWrapper from './CronClientWrapper'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CronEnginePage() {
  const supabase = await createClient()
  const adminDb = createAdminClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminUser } = await adminDb.from('users').select('role').eq('id', user.id).single()
  if (adminUser?.role !== 'ADMIN') redirect('/dashboard')

  // Live stats for the summary cards
  const [
    { data: nodes },
    { data: scheduleRow },
    { data: lastRunRow }
  ] = await Promise.all([
    adminDb.from('binary_nodes').select(`
      id, is_active,
      binary_node_volumes ( left_bv, right_bv, left_bv_carryover, right_bv_carryover, is_binary_earning_active, binary_income_limit_paise )
    `),
    adminDb.from('platform_settings').select('value').eq('key', 'cron_schedule').maybeSingle(),
    adminDb.from('platform_settings').select('value').eq('key', 'cron_last_run').maybeSingle(),
  ])

  // Calculate live BV stats
  let totalActiveNodes = 0
  let totalUnsettledLeftBv = 0
  let totalUnsettledRightBv = 0
  let qualifiableNodes = 0
  let projectedPayout = 0

  if (nodes) {
    for (const node of nodes) {
      if (!node.is_active) continue
      totalActiveNodes++
      const vol = node.binary_node_volumes as any
      if (!vol) continue
      const leftTotal = (vol.left_bv || 0) + (vol.left_bv_carryover || 0)
      const rightTotal = (vol.right_bv || 0) + (vol.right_bv_carryover || 0)
      totalUnsettledLeftBv += leftTotal
      totalUnsettledRightBv += rightTotal
      const match = Math.min(leftTotal, rightTotal)
      if (match >= 100 && vol.is_binary_earning_active) {
        qualifiableNodes++
        const pairs = Math.floor(match / 100)
        projectedPayout += pairs * 800 * 100 // in paise
      }
    }
  }

  const schedule = scheduleRow?.value ? JSON.parse(scheduleRow.value as string) : { closingDay: 'SUNDAY', closingTime: '23:59' }
  const lastRun = lastRunRow?.value ? JSON.parse(lastRunRow.value as string) : null

  return (
    <CronClientWrapper
      totalActiveNodes={totalActiveNodes}
      qualifiableNodes={qualifiableNodes}
      totalUnsettledLeftBv={totalUnsettledLeftBv}
      totalUnsettledRightBv={totalUnsettledRightBv}
      projectedPayout={projectedPayout}
      schedule={schedule}
      lastRun={lastRun}
    />
  )
}
