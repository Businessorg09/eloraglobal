import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminDb = createAdminClient()

    // 1. Get wallets with negative balance
    const { data: wallets } = await adminDb.from('wallets').select('*')
    const negWallets = wallets?.filter(w => w.total_balance_paise < 0) || []
    
    const results = []

    for (const w of negWallets) {
      // Find package purchases for this user
      const { data: purchases } = await adminDb
        .from('transactions')
        .select('*')
        .eq('user_id', w.user_id)
        .eq('transaction_type', 'PACKAGE_PURCHASE')
      
      let amountToRevert = 0;
      for (const p of (purchases || [])) {
        amountToRevert += Math.abs(p.amount_paise)
      }

      if (amountToRevert > 0) {
        // Revert wallet withdrawn amount by the purchase amount
        const newWithdrawn = Math.max(0, w.total_withdrawn_paise - amountToRevert)
        await adminDb.from('wallets').update({ 
          total_withdrawn_paise: newWithdrawn 
        }).eq('id', w.id)
        
        results.push({ userId: w.user_id, reverted: amountToRevert, newWithdrawn })
      }
    }

    return NextResponse.json({ success: true, fixed: results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
