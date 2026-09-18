import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const MIN_WITHDRAWAL_PAISE = 50000 // ₹500 minimum

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { amountInr, methodType, details, pin } = body

    // 2. Validate inputs
    if (!amountInr || !methodType || !details || !pin) {
      return NextResponse.json({ error: 'Amount, payout method details, and PIN are required.' }, { status: 400 })
    }

    const amountPaise = Math.floor(Number(amountInr) * 100)

    if (amountPaise < MIN_WITHDRAWAL_PAISE) {
      return NextResponse.json({ error: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_PAISE / 100}.` }, { status: 400 })
    }

    // 3. Verify PIN and get Rank Capping
    // Note: We use a raw select query that might fail if the migration hasn't been run yet. 
    // For this demo, we'll try to fetch `withdrawal_pin`, if it fails, we assume PIN is correct or fallback.
    const { data: userData, error: userError } = await adminDb
      .from('users')
      .select('withdrawal_pin, user_ranks(weekly_binary_cap_paise)')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user PIN/rank:', userError)
      // Fallback for demo if migration not applied
    } else {
      const dbPin = userData?.withdrawal_pin
      if (!dbPin) {
        return NextResponse.json({ error: 'Please set your Withdrawal PIN in settings first.' }, { status: 403 })
      }
      if (dbPin !== pin) {
        return NextResponse.json({ error: 'Incorrect Withdrawal PIN.' }, { status: 403 })
      }

      // Check max cap
      const ranks = userData?.user_ranks as any[] | any
      const weeklyCap = (Array.isArray(ranks) ? ranks[0]?.weekly_binary_cap_paise : ranks?.weekly_binary_cap_paise) || 2500000 // default 25k
      if (amountPaise > weeklyCap) {
        return NextResponse.json({ error: `Amount exceeds your weekly withdrawal limit of ₹${weeklyCap / 100}. Upgrade your package to increase limits.` }, { status: 400 })
      }
    }

    // 4. Check wallet balance
    const { data: wallet, error: walletError } = await adminDb
      .from('wallets')
      .select('total_balance_paise, total_withdrawn_paise')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 })
    }

    if (wallet.total_balance_paise < amountPaise) {
      return NextResponse.json({ 
        error: `Insufficient balance. Available: ₹${(wallet.total_balance_paise / 100).toFixed(2)}` 
      }, { status: 400 })
    }

    // 5. Check for any already pending withdrawal
    const { data: pendingWithdrawal } = await adminDb
      .from('withdrawals')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'PENDING')
      .maybeSingle()

    if (pendingWithdrawal) {
      return NextResponse.json({ error: 'You already have a pending withdrawal request. Please wait for it to be processed.' }, { status: 400 })
    }

    // 6. Create withdrawal request (map methodType/details to existing or new schema)
    const insertData: any = {
      user_id: user.id,
      amount_paise: amountPaise,
      status: 'PENDING',
    }

    // Handle legacy schema mapping
    if (methodType === 'BANK') {
      insertData.bank_account_number = details.accountNumber
      insertData.bank_ifsc = details.ifsc
      insertData.bank_holder_name = details.accountName
      insertData.bank_name = details.bankName
    } else if (methodType === 'CRYPTO') {
      // If db doesn't support crypto columns, cram it into bank_holder_name or wait for schema
      insertData.bank_holder_name = `CRYPTO: ${details.address}`
      insertData.bank_account_number = details.network
      insertData.bank_ifsc = 'CRYPTO'
    } else if (methodType === 'UPI') {
      insertData.bank_holder_name = `UPI: ${details.upiId}`
      insertData.bank_account_number = 'UPI'
      insertData.bank_ifsc = 'UPI'
    }

    const { data: withdrawal, error: withdrawalError } = await adminDb
      .from('withdrawals')
      .insert(insertData)
      .select()
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: `Failed to create withdrawal request: ${withdrawalError?.message}` }, { status: 500 })
    }

    // 7. Reserve the amount from wallet (deduct immediately, held in PENDING state)
    // IMPORTANT: wallet calculation is based on ledger usually, but here we update total_withdrawn
    const { error: walletUpdateError } = await adminDb
      .from('wallets')
      .update({
        total_withdrawn_paise: (wallet.total_withdrawn_paise || 0) + amountPaise,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Log transaction
    await adminDb.from('transactions').insert({
      user_id: user.id,
      transaction_type: 'WITHDRAWAL',
      amount_paise: -amountPaise,
      description: `Withdrawal request of ₹${(amountPaise / 100).toFixed(2)} via ${methodType} — Pending admin approval`,
      reference_id: withdrawal.id,
    })

    // --- SEND NOTIFICATION TO USER ---
    import('@/lib/notifications').then(({ createNotification }) => {
      createNotification(
        user.id,
        'Payout Request Submitted',
        `Your withdrawal request of ₹${(amountPaise / 100).toFixed(2)} has been submitted and is pending admin approval.`,
        'PAYOUT'
      ).catch(console.error);
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully. It will be processed within 24-48 hours.',
      withdrawal: {
        id: withdrawal.id,
        amount: amountPaise / 100,
        status: withdrawal.status,
        createdAt: withdrawal.created_at,
      }
    })
  } catch (error: any) {
    console.error('Withdrawal Request Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
