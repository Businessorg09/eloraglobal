import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { packageId, transactionReference, paymentMethod } = await request.json()

    if (!packageId || !transactionReference) {
      return NextResponse.json({ error: 'Package ID and Transaction Reference (UTR) are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Fetch package details
    const { data: pkg, error: pkgError } = await adminDb
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Package not found.' }, { status: 404 })
    }

    // 3. (Removed block that prevented users already in the binary tree from buying a package)

    // 4. Check if they already have a pending request
    const { data: allPurchases } = await adminDb
      .from('package_purchases')
      .select('id, payment_gateway_id')
      .eq('user_id', user.id)

    const existingRequest = (allPurchases || []).find(p => {
      try {
        const meta = p.payment_gateway_id ? JSON.parse(p.payment_gateway_id) : { status: 'APPROVED' };
        return meta.status === 'PENDING';
      } catch(e) { return false; }
    });
      
    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending purchase request.' }, { status: 400 })
    }

    // 5. Record pending package purchase request
    const { error: purchaseError } = await adminDb
      .from('package_purchases')
      .insert({
        user_id: user.id,
        package_id: pkg.id,
        amount_paid_paise: pkg.price_inr,
        bv_generated: pkg.business_volume,
        purchase_type: 'INITIAL',
        payment_gateway_id: JSON.stringify({
          status: 'PENDING',
          transaction_reference: transactionReference,
          payment_method: paymentMethod || 'UPI'
        })
      })

    if (purchaseError) {
      console.error('Error recording purchase request:', purchaseError)
      return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Purchase request submitted successfully. Waiting for admin approval.',
    })
  } catch (error: any) {
    console.error('Package Request API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
