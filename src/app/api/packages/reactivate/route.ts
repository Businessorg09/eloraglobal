import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { transactionReference, paymentMethod } = await request.json()

    if (!transactionReference) {
      return NextResponse.json({ error: 'Transaction Reference (UTR) is required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Find the user's current package (from their latest approved purchase)
    const { data: allPurchases, error: purchaseError } = await adminDb
      .from('package_purchases')
      .select('package_id, packages!package_id(*), payment_gateway_id, id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (purchaseError) {
      return NextResponse.json({ error: `Error checking purchases: ${purchaseError.message}` }, { status: 500 })
    }

    const latestPurchase = (allPurchases || []).find(p => {
      try {
        const meta = p.payment_gateway_id ? JSON.parse(p.payment_gateway_id) : { status: 'APPROVED' };
        return meta.status === 'APPROVED';
      } catch(e) { return true; }
    });

    if (!latestPurchase) {
      return NextResponse.json({ error: 'No existing package found to reactivate.' }, { status: 400 })
    }

    const currentPkg = (latestPurchase as any).packages

    // 3. Check if they already have a pending request
    const existingRequest = (allPurchases || []).find(p => {
      try {
        const meta = p.payment_gateway_id ? JSON.parse(p.payment_gateway_id) : { status: 'APPROVED' };
        return meta.status === 'PENDING';
      } catch(e) { return false; }
    });
      
    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending purchase request.' }, { status: 400 })
    }

    // 4. Record pending package reactivation request
    const { error: recordError } = await adminDb
      .from('package_purchases')
      .insert({
        user_id: user.id,
        package_id: currentPkg.id,
        amount_paid_paise: currentPkg.price_inr,
        bv_generated: currentPkg.business_volume,
        purchase_type: 'REACTIVATION',
        payment_gateway_id: JSON.stringify({
          status: 'PENDING',
          transaction_reference: transactionReference,
          payment_method: paymentMethod || 'UPI'
        })
      })

    if (recordError) {
      return NextResponse.json({ error: `Failed to submit reactivation request: ${recordError?.message}` }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Reactivation request submitted successfully. Waiting for admin approval.',
    })
  } catch (error: any) {
    console.error('Package Reactivation API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
