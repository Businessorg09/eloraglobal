import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { purchaseId, reason } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data: adminUser } = await adminDb.from('users').select('role').eq('id', user.id).single()

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Fetch the purchase request
    const { data: purchase, error: purchaseError } = await adminDb
      .from('package_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase request not found.' }, { status: 404 })
    }

    let meta: any = { status: 'APPROVED' };
    try { if (purchase.payment_gateway_id) meta = JSON.parse(purchase.payment_gateway_id); } catch(e){}

    if (meta.status !== 'PENDING') {
      return NextResponse.json({ error: 'Purchase is not pending.' }, { status: 400 })
    }

    // 2. Update status to REJECTED inside payment_gateway_id
    meta.status = 'REJECTED';
    meta.rejection_reason = reason || 'Payment not verified';
    meta.approved_by = user.id;
    meta.approved_at = new Date().toISOString();

    const { error: updateError } = await adminDb
      .from('package_purchases')
      .update({
        payment_gateway_id: JSON.stringify(meta)
      })
      .eq('id', purchaseId)

    if (updateError) {
      throw new Error('Failed to update purchase status')
    }

    return NextResponse.json({ message: 'Purchase request rejected successfully.' })
  } catch (error: any) {
    console.error('Reject Purchase API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
