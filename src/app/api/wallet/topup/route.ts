import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { amount, utr } = await req.json()
    const amountPaise = Math.floor(Number(amount) * 100)

    if (!amountPaise || amountPaise <= 0 || !utr) {
      return NextResponse.json({ error: 'Valid amount and UTR number are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Check if a pending topup with this UTR already exists
    const { data: existingTopup } = await adminDb
      .from('transactions')
      .select('id')
      .eq('transaction_type', 'WALLET_TOPUP')
      .eq('description', `Manual Topup Request (UTR: ${utr})`)
      .maybeSingle()
      
    if (existingTopup) {
      return NextResponse.json({ error: 'A topup request with this UTR is already pending.' }, { status: 400 })
    }

    // 3. Create a pending top-up record
    const { error: insertError } = await adminDb.from('wallet_topups').insert({
      user_id: user.id,
      amount_paise: amountPaise,
      transaction_reference: utr,
      status: 'PENDING'
    })

    if (insertError) {
      console.error('Failed to save topup request:', insertError)
      return NextResponse.json({ error: 'Failed to submit top-up request. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Top-up request submitted successfully. Waiting for admin approval.',
      bonusApplied: amount * 0.03
    })
  } catch (error: any) {
    console.error('Topup API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
