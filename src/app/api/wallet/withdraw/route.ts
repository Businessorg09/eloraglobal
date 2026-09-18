import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Configuration constants
const MIN_WITHDRAWAL_PAISE = 500 * 100; // ₹500
const TDS_PERCENTAGE = 0.05; // 5%
const ADMIN_FEE_PERCENTAGE = 0.05; // 5%

export async function POST(req: Request) {
  try {
    const { amount, pin } = await req.json()
    const amountPaise = Math.floor(Number(amount) * 100)

    if (!amountPaise || amountPaise < MIN_WITHDRAWAL_PAISE) {
      return NextResponse.json({ error: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_PAISE / 100}` }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Verify Transaction PIN
    const { verifyPin } = await import('@/lib/pin')
    const { data: userData } = await adminDb.from('users').select('transaction_pin_hash').eq('id', user.id).single()
    if (!userData?.transaction_pin_hash) {
      return NextResponse.json({ error: 'Transaction PIN is not set. Please set it in Settings.' }, { status: 400 })
    }
    if (!pin || !verifyPin(pin, userData.transaction_pin_hash)) {
      return NextResponse.json({ error: 'Invalid Transaction PIN.' }, { status: 403 })
    }

    // 3. Check KYC Status
    const { data: profile } = await adminDb.from('users').select('kyc_verified').eq('id', user.id).single()
    if (!profile?.kyc_verified) {
      return NextResponse.json({ error: 'KYC Verification is required to withdraw funds.' }, { status: 403 })
    }

    // 3. Fetch KYC Details for Bank Account
    const { data: kyc } = await adminDb.from('kyc_details').select('*').eq('user_id', user.id).single()
    if (!kyc || kyc.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your KYC details are not yet approved by admin.' }, { status: 403 })
    }

    // 4. Check Wallet Balance
    const { data: wallet } = await adminDb.from('wallets').select('id, total_balance_paise, total_withdrawn_paise').eq('user_id', user.id).single()
    
    // Fetch manual topups to calculate true balance
    const { data: topups } = await adminDb.from('wallet_topups').select('amount_paise').eq('user_id', user.id).eq('status', 'APPROVED')
    const manualTopups = (topups || []).reduce((sum, t) => sum + t.amount_paise, 0)
    
    const trueBalancePaise = Number(wallet?.total_balance_paise || 0) + manualTopups

    if (!wallet || trueBalancePaise < amountPaise) {
      return NextResponse.json({ error: 'Insufficient wallet balance.' }, { status: 400 })
    }

    // 5. Calculate Deductions (Integer Math)
    const tdsDeductedPaise = Math.floor(amountPaise * TDS_PERCENTAGE)
    const adminFeePaise = Math.floor(amountPaise * ADMIN_FEE_PERCENTAGE)
    const netPayablePaise = amountPaise - tdsDeductedPaise - adminFeePaise

    // 6. Execute Transaction (Double Entry & Wallet Update)
    // a. Create Withdrawal Request
    const { data: withdrawal, error: withdrawalError } = await adminDb.from('withdrawals').insert({
      user_id: user.id,
      amount_requested_paise: amountPaise,
      tds_deducted_paise: tdsDeductedPaise,
      admin_fee_deducted_paise: adminFeePaise,
      net_payable_paise: netPayablePaise,
      bank_account_details: `A/C: ${kyc.bank_account_number}, IFSC: ${kyc.bank_ifsc}, PAN: ${kyc.pan_number}`,
    }).select().single()

    if (withdrawalError || !withdrawal) {
      throw new Error('Failed to create withdrawal request.')
    }

    // b. Deduct from wallet
    await adminDb.from('wallets').update({
      total_withdrawn_paise: Number(wallet.total_withdrawn_paise) + amountPaise,
      updated_at: new Date().toISOString()
    }).eq('id', wallet.id)

    // c. Add transaction record
    await adminDb.from('transactions').insert({
      user_id: user.id,
      transaction_type: 'WITHDRAWAL',
      amount_paise: -amountPaise, // Negative because debit
      description: `Withdrawal Request (Net Payable: ₹${netPayablePaise / 100})`,
      reference_id: withdrawal.id
    })

    // d. Ledger Double-Entry
    const { data: journal } = await adminDb.from('ledger_journals').insert({
      idempotency_key: `withdrawal_${withdrawal.id}`,
      reference_type: 'WITHDRAWAL',
      reference_id: withdrawal.id,
      description: `Withdrawal Request for User ${user.id}`
    }).select().single()

    if (journal) {
      const accounts = ['1001-USER-WALLET', '2011-WITHDRAWAL-PENDING', '2010-TDS-PAYABLE', '4001-ADMIN-FEE-REVENUE']
      const { data: accs } = await adminDb.from('ledger_accounts').select('id, code').in('code', accounts)
      
      const accMap = accs?.reduce((acc: any, curr: any) => { acc[curr.code] = curr.id; return acc; }, {})
      
      if (accMap && Object.keys(accMap).length === 4) {
        await adminDb.from('ledger_journal_postings').insert([
          { journal_id: journal.id, account_id: accMap['1001-USER-WALLET'], debit_paise: amountPaise, credit_paise: 0 },
          { journal_id: journal.id, account_id: accMap['2011-WITHDRAWAL-PENDING'], debit_paise: 0, credit_paise: netPayablePaise },
          { journal_id: journal.id, account_id: accMap['2010-TDS-PAYABLE'], debit_paise: 0, credit_paise: tdsDeductedPaise },
          { journal_id: journal.id, account_id: accMap['4001-ADMIN-FEE-REVENUE'], debit_paise: 0, credit_paise: adminFeePaise },
        ])
        
        await adminDb.rpc('increment_ledger_balance', { acc_id: accMap['1001-USER-WALLET'], amount: -amountPaise }) // User wallet decreases
        await adminDb.rpc('increment_ledger_balance', { acc_id: accMap['2011-WITHDRAWAL-PENDING'], amount: netPayablePaise })
        await adminDb.rpc('increment_ledger_balance', { acc_id: accMap['2010-TDS-PAYABLE'], amount: tdsDeductedPaise })
        await adminDb.rpc('increment_ledger_balance', { acc_id: accMap['4001-ADMIN-FEE-REVENUE'], amount: adminFeePaise })
      }
    }

    return NextResponse.json({ message: 'Withdrawal request submitted successfully.', withdrawal })
  } catch (error: any) {
    console.error('Withdrawal API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
