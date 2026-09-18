import { createAdminClient } from '@/lib/supabase/admin'
import UserTable from './UserTable'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const adminDb = createAdminClient()

  // Fetch users with their rank and wallet data
  const { data: users } = await adminDb
    .from('users')
    .select(`
      id,
      full_name,
      username,
      email,
      phone,
      is_active,
      kyc_verified,
      created_at,
      user_ranks(current_rank, active_direct_count),
      wallets(total_balance_paise, total_withdrawn_paise)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display-md text-display-md font-bold text-on-surface">User Directory</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage network members, ranks, and KYC status.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low overflow-hidden p-6">
        <UserTable initialData={users || []} />
      </div>
    </div>
  )
}
