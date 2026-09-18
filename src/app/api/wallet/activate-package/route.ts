import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { resolvePlacement, buildChildPath, propagateBv } from '@/lib/engines/binary-tree'

export async function POST(req: Request) {
  try {
    const { targetUserId, packageId, pin } = await req.json()

    if (!targetUserId || !packageId) {
      return NextResponse.json({ error: 'Downline User ID and Package ID are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user (Sponsor)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 1.5. Verify Transaction PIN
    const { verifyPin } = await import('@/lib/pin')
    const { data: userData } = await adminDb.from('users').select('transaction_pin_hash').eq('id', user.id).single()
    if (!userData?.transaction_pin_hash) {
      return NextResponse.json({ error: 'Transaction PIN is not set. Please set it in Settings.' }, { status: 400 })
    }
    if (!pin || !verifyPin(pin, userData.transaction_pin_hash)) {
      return NextResponse.json({ error: 'Invalid Transaction PIN.' }, { status: 403 })
    }

    // 2. Fetch target downline user
    // The frontend passes the username (e.g. jdoe123) in targetUserId
    const { data: downlineUser, error: downlineError } = await adminDb
      .from('users')
      .select('id, referred_by, referred_position')
      .eq('username', targetUserId.toLowerCase())
      .single()

    if (downlineError || !downlineUser) {
      return NextResponse.json({ error: 'Downline user not found. Please enter a valid username.' }, { status: 404 })
    }

    if (downlineUser.referred_by !== user.id) {
      return NextResponse.json({ error: 'You can only activate packages for your direct referrals.' }, { status: 403 })
    }

    // 3. Check if downline already has a package/node
    const { data: existingNode } = await adminDb.from('binary_nodes').select('id, is_active, parent_id').eq('user_id', downlineUser.id).maybeSingle()
    if (existingNode && existingNode.is_active) {
      return NextResponse.json({ error: 'Downline user is already active in the binary tree.' }, { status: 400 })
    }

    // 4. Fetch Package Details
    const { data: pkg } = await adminDb.from('packages').select('*').eq('id', packageId).single()
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package.' }, { status: 400 })
    }

    // 5. Check Wallet Balance & Apply 3% Discount
    const discountPaise = Math.floor(pkg.price_inr * 0.03)
    const netCostPaise = pkg.price_inr - discountPaise

    const { data: wallet } = await adminDb.from('wallets').select('id, total_balance_paise, total_withdrawn_paise').eq('user_id', user.id).single()
    
    // Fetch manual topups and previous purchases to calculate true deposit balance
    const { data: topups } = await adminDb.from('wallet_topups').select('amount_paise').eq('user_id', user.id).eq('status', 'APPROVED')
    const manualTopups = (topups || []).reduce((sum, t) => sum + t.amount_paise, 0)
    
    const { data: priorPurchases } = await adminDb.from('transactions').select('amount_paise').eq('user_id', user.id).eq('transaction_type', 'PACKAGE_PURCHASE')
    const totalSpentOnPackages = Math.abs((priorPurchases || []).reduce((sum, t) => sum + t.amount_paise, 0))
    
    const depositBalancePaise = Math.max(0, manualTopups - totalSpentOnPackages)

    if (depositBalancePaise < netCostPaise) {
      return NextResponse.json({ error: `Insufficient cash wallet balance. You need ₹${(netCostPaise/100).toLocaleString()} (incl 3% discount). Please deposit funds.` }, { status: 400 })
    }

    // --- TRANSACTION START ---

    // Note: Since we are only using the deposit (cash) wallet, we do not deduct from total_withdrawn_paise
    // (which tracks commission withdrawals). The purchase is simply tracked by the PACKAGE_PURCHASE transaction.

    // 7. Record transaction for Sponsor
    const { error: txnError } = await adminDb.from('transactions').insert({
      user_id: user.id,
      transaction_type: 'PACKAGE_PURCHASE',
      amount_paise: -netCostPaise,
      description: `Activated Package ${pkg.name} for Downline ${targetUserId.toUpperCase()} (3% Discount Applied)`
    })
    
    if (txnError) throw new Error('Failed to record transaction: ' + txnError.message)

    // 8. Record the Purchase for Downline (Auto-Approved)
    const { data: purchase, error: purchaseError } = await adminDb.from('package_purchases').insert({
      user_id: downlineUser.id,
      package_id: pkg.id,
      amount_paid_paise: pkg.price_inr, // Full MRP recorded
      bv_generated: pkg.business_volume,
      purchase_type: 'INITIAL',
      payment_gateway_id: JSON.stringify({
        approved_by: user.id, // Approved by sponsor's wallet
        approved_at: new Date().toISOString(),
        transaction_reference: 'WALLET_ACTIVATION'
      })
    }).select().single()

    if (purchaseError) {
      throw new Error('Failed to record package purchase: ' + purchaseError.message)
    }

    // --- MLM PLACEMENT LOGIC ---
    let nodeId = existingNode?.id
    let placementParentId = existingNode?.parent_id

    if (!existingNode) {
      // Fallback: If node doesn't exist, place them now
      const placement = await resolvePlacement(adminDb, user.id, downlineUser.referred_position as 'L' | 'R' | undefined)
      placementParentId = placement.parentId
      const { data: parentNode } = await adminDb.from('binary_nodes').select('path').eq('id', placement.parentId).single()
      const nodePath = buildChildPath(parentNode?.path || '', placement.position, downlineUser.id)

      const { data: sponsorNode } = await adminDb.from('binary_nodes').select('id').eq('user_id', user.id).maybeSingle()

      const { data: newNode, error: newNodeError } = await adminDb.from('binary_nodes').insert({
        user_id: downlineUser.id,
        sponsor_id: sponsorNode?.id || null,
        parent_id: placement.parentId,
        position: placement.position,
        path: nodePath,
        is_active: true
      }).select().single()
      
      if (newNodeError) {
        throw new Error('Failed to place node in binary tree: ' + newNodeError.message)
      }
      
      if (newNode) {
        nodeId = newNode.id
        const { error: volInsertError } = await adminDb.from('binary_node_volumes').insert({
          node_id: nodeId,
          binary_income_limit_paise: pkg.binary_income_limit || 0,
          is_binary_earning_active: true
        })
        if (volInsertError) throw new Error('Failed to setup binary volume: ' + volInsertError.message)
      }
    } else {
      // Activate existing inactive node
      const { error: nodeUpdateError } = await adminDb.from('binary_nodes').update({ is_active: true }).eq('id', nodeId)
      if (nodeUpdateError) throw new Error('Failed to activate node: ' + nodeUpdateError.message)
      
      const { error: volUpdateError } = await adminDb.from('binary_node_volumes').update({
        binary_income_limit_paise: pkg.binary_income_limit || 0,
        is_binary_earning_active: true
      }).eq('node_id', nodeId)
      if (volUpdateError) throw new Error('Failed to update node volume: ' + volUpdateError.message)
    }

    if (nodeId) {
      // 12. Propagate BV upwards
      if (pkg.business_volume > 0 && placementParentId) {
        await propagateBv(adminDb, nodeId, pkg.business_volume)
      }

      // 13. Increment sponsor's active direct count
      const { data: sponsorRank } = await adminDb.from('user_ranks').select('active_direct_count').eq('user_id', user.id).single()
      if (sponsorRank) {
        await adminDb.from('user_ranks').update({
          active_direct_count: (sponsorRank.active_direct_count || 0) + 1,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id)
      }
    }

    return NextResponse.json({ message: 'Downline package activated successfully!', netCost: netCostPaise / 100 })
  } catch (error: any) {
    console.error('Activate Package API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
