import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET: Admin fetches all pending withdrawals
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await adminDb
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admins only.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'PENDING'

    const { data: withdrawals, error } = await adminDb
      .from('withdrawals')
      .select(`
        *,
        users (
          full_name,
          username,
          email,
          phone
        )
      `)
      .eq('status', statusFilter)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch withdrawals.' }, { status: 500 })
    }

    return NextResponse.json({
      withdrawals: (withdrawals || []).map((w: any) => ({
        id: w.id,
        userId: w.user_id,
        amount: w.amount_paise / 100,
        bankAccountNumber: w.bank_account_number,
        bankIfsc: w.bank_ifsc,
        bankHolderName: w.bank_holder_name,
        bankName: w.bank_name,
        status: w.status,
        rejectionReason: w.rejection_reason,
        processedAt: w.processed_at,
        createdAt: w.created_at,
        user: {
          fullName: w.users?.full_name,
          username: w.users?.username,
          email: w.users?.email,
          phone: w.users?.phone,
        }
      }))
    })
  } catch (error: any) {
    console.error('Admin Withdrawals Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
