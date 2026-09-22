export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Fetch user profile
    const { data: profile, error: profileError } = await adminDb
      .from('users')
      .select('id, full_name, username, email, phone, referral_code, role, is_active, kyc_verified, created_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    // 3. Fetch package history
    const { data: purchaseHistory } = await adminDb
      .from('package_purchases')
      .select(`
        id, package_id, created_at, amount_paid_paise, payment_gateway_id,
        packages!package_purchases_package_id_fkey ( name )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const formattedPurchases = (purchaseHistory || []).map((p: any) => {
      let meta = { status: p.status || 'PENDING', transaction_reference: '' };
      try { 
        if (p.payment_gateway_id) {
          const parsed = JSON.parse(p.payment_gateway_id);
          meta = { ...meta, ...parsed };
        }
      } catch(e){}
      
      // Overwrite with actual status if available
      const actualStatus = meta.status === 'APPROVED' || p.status === 'APPROVED' ? 'APPROVED' : (p.status || meta.status || 'PENDING');

      return {
        id: p.id,
        date: new Date(p.created_at).toLocaleDateString(),
        package_name: (p.packages as any)?.name,
        amount: `₹${(p.amount_paid_paise / 100).toLocaleString('en-IN')}`,
        status: actualStatus,
        utr: meta.transaction_reference || 'N/A'
      }
    })

    const latestApprovedPurchase = formattedPurchases.find(p => p.status === 'APPROVED')
    let package_name = latestApprovedPurchase?.package_name || null
    if (package_name === 'Pro') package_name = 'Growth Partner'
    if (package_name === 'Elite') package_name = 'Executive Pro'
    
    const package_id = purchaseHistory?.find(p => p.id === latestApprovedPurchase?.id)?.package_id || null

    // 4. Fetch Trading Account
    const { data: tradingAccount } = await adminDb
      .from('trading_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ 
      profile: {
        ...profile,
        package_name,
        package_id,
        trading_account: tradingAccount || null
      } 
    })
  } catch (error: any) {
    console.error('Profile API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
