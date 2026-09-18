import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { newPackageId, transactionReference, paymentMethod } = await request.json()

    if (!newPackageId || !transactionReference) {
      return NextResponse.json({ error: 'New Package ID and Transaction Reference (UTR) are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Fetch the new package details
    const { data: newPkg, error: newPkgError } = await adminDb
      .from('packages')
      .select('*')
      .eq('id', newPackageId)
      .single()

    if (newPkgError || !newPkg) {
      return NextResponse.json({ error: 'New package not found.' }, { status: 404 })
    }

    // 3. Find the user's current package (from their latest approved purchase)
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
      return NextResponse.json({ error: 'No existing package found to upgrade from.' }, { status: 400 })
    }

    const currentPkg = (latestPurchase as any).packages

    // 4. Verify this is actually an upgrade (higher BV / price)
    if (newPkg.business_volume <= currentPkg.business_volume) {
      return NextResponse.json({ error: 'Cannot upgrade to a package of equal or lower volume.' }, { status: 400 })
    }

    // 5. Check if they already have a pending request
    const existingRequest = (allPurchases || []).find(p => {
      try {
        const meta = p.payment_gateway_id ? JSON.parse(p.payment_gateway_id) : { status: 'APPROVED' };
        return meta.status === 'PENDING';
      } catch(e) { return false; }
    });
      
    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending purchase request.' }, { status: 400 })
    }

    // 6. Calculate upgrade difference
    const priceDiffPaise = newPkg.price_inr - currentPkg.price_inr
    const bvDiff = newPkg.business_volume - currentPkg.business_volume

    // 7. Record pending package upgrade request
    const { error: recordError } = await adminDb
      .from('package_purchases')
      .insert({
        user_id: user.id,
        package_id: newPkg.id,
        amount_paid_paise: priceDiffPaise,
        bv_generated: bvDiff,
        purchase_type: 'UPGRADE',
        payment_gateway_id: JSON.stringify({
          status: 'PENDING',
          transaction_reference: transactionReference,
          payment_method: paymentMethod || 'UPI'
        }),
        previous_package_id: currentPkg.id
      })

    if (recordError) {
      return NextResponse.json({ error: `Failed to submit upgrade request: ${recordError?.message}` }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Upgrade request submitted successfully. Waiting for admin approval.',
    })
  } catch (error: any) {
    console.error('Package Upgrade API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
