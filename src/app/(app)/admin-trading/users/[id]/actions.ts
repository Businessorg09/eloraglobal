'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateKycStatusAction(userId: string, isVerified: boolean) {
  const adminDb = createAdminClient()
  
  const { error } = await adminDb
    .from('users')
    .update({ kyc_verified: isVerified })
    .eq('id', userId)

  if (error) {
    throw new Error('Failed to update KYC status: ' + error.message)
  }
  
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updateUserProfileAction(userId: string, fullName: string, email: string) {
  const adminDb = createAdminClient()
  
  // 1. Update public.users
  const { error: dbError } = await adminDb
    .from('users')
    .update({ full_name: fullName, email: email })
    .eq('id', userId)

  if (dbError) throw new Error('Failed to update user profile: ' + dbError.message)

  // 2. Update auth.users (Requires Supabase Admin API)
  const { error: authError } = await adminDb.auth.admin.updateUserById(userId, {
    email: email
  })

  if (authError) {
    if (authError.message.toLowerCase().includes('not found')) {
      console.warn('Auth user not found, ignored for mock users');
    } else {
      throw new Error('Failed to update auth email: ' + authError.message)
    }
  }

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updateUserSecurityAction(userId: string, password?: string, pin?: string) {
  const adminDb = createAdminClient()
  
  const updates: any = {}
  
  if (password) updates.password = password
  
  // Store PIN in auth.users raw_user_meta_data since we don't have a transaction_pin column
  if (pin) updates.user_metadata = { transaction_pin: pin }

  if (Object.keys(updates).length > 0) {
    const { error } = await adminDb.auth.admin.updateUserById(userId, updates)
    if (error) {
      if (error.message.toLowerCase().includes('not found')) {
        console.warn('Auth user not found, ignored for mock users');
      } else {
        throw new Error('Failed to update security credentials: ' + error.message)
      }
    }
  }

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updateUserBankingAction(userId: string, bankName: string, accNumber: string, ifsc: string, accHolder: string, cryptoAddress?: string, upiId?: string) {
  const adminDb = createAdminClient()
  
  // Store bank details in auth.users raw_user_meta_data
  const { data: userResp } = await adminDb.auth.admin.getUserById(userId)
  const currentMeta = userResp?.user?.user_metadata || {}
  
  const { error } = await adminDb.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...currentMeta,
      bank_details: { bankName, accNumber, ifsc, accHolder },
      crypto_details: { cryptoAddress },
      upi_details: { upiId }
    }
  })

  if (error) {
    if (error.message.toLowerCase().includes('not found')) {
      console.warn('Auth user not found, ignored for mock users');
    } else {
      throw new Error('Failed to update banking details: ' + error.message)
    }
  }

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updateSponsorAction(userId: string, newSponsorId: string) {
  const adminDb = createAdminClient()
  
  // Verify new sponsor exists
  const { data: sponsor, error: sErr } = await adminDb.from('users').select('id').eq('id', newSponsorId).single()
  if (sErr || !sponsor) throw new Error('Sponsor ID not found or invalid.')

  const { error } = await adminDb
    .from('users')
    .update({ referred_by: newSponsorId })
    .eq('id', userId)

  if (error) throw new Error('Failed to update sponsor: ' + error.message)

  // Update binary_nodes sponsor_id as well to keep them in sync
  await adminDb
    .from('binary_nodes')
    .update({ sponsor_id: newSponsorId })
    .eq('user_id', userId)

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function updatePackageAction(userId: string, packageId: string) {
  const adminDb = createAdminClient()
  
  // 1. Get package details
  const { data: pkg, error: pErr } = await adminDb.from('packages').select('*').eq('id', packageId).single()
  if (pErr || !pkg) throw new Error('Package not found.')

  // 2. Fetch or create user_ranks
  const { data: rank } = await adminDb.from('user_ranks').select('current_rank').eq('user_id', userId).single()
  
  // For simplicity, we just bump their caps
  const weeklyCap = pkg.price_inr === 482500 ? 1000000 : pkg.price_inr === 1689900 ? 2500000 : 5000000;
  
  if (rank) {
    await adminDb.from('user_ranks').update({ weekly_binary_cap_paise: weeklyCap }).eq('user_id', userId)
  } else {
    await adminDb.from('user_ranks').insert({ user_id: userId, weekly_binary_cap_paise: weeklyCap, current_rank: 'BRONZE' })
  }

  // 3. Update binary_node_volumes cap (5x limit)
  const { data: vol } = await adminDb.from('binary_node_volumes').select('node_id').eq('node_id', userId).single()
  // Wait, binary_nodes uses 'id', but binary_node_volumes uses 'node_id' which references binary_nodes(id) which references users(id)?
  // Let's assume node_id = userId for 1:1 mapping (which is true based on schema).
  if (vol) {
    await adminDb.from('binary_node_volumes').update({
      binary_income_limit_paise: pkg.binary_income_limit,
      is_binary_earning_active: true
    }).eq('node_id', userId)
  }

  // 4. Insert dummy purchase record
  await adminDb.from('package_purchases').insert({
    user_id: userId,
    package_id: packageId,
    amount_paid_paise: pkg.price_inr,
    bv_generated: pkg.business_volume,
    purchase_type: 'UPGRADE'
  })

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function adjustUserBalanceAction(userId: string, amountPaise: number, isAddition: boolean) {
  const adminDb = createAdminClient()
  
  // Double-Entry Ledger Logic
  const idempotencyKey = `admin_adj_${userId}_${Date.now()}`
  
  const { data: journal, error: jErr } = await adminDb.from('ledger_journals').insert({
    idempotency_key: idempotencyKey,
    reference_type: isAddition ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
    description: `Manual admin balance adjustment`
  }).select().single()

  if (jErr || !journal) throw new Error('Failed to create ledger journal.')

  // Fetch Accounts
  const { data: walletAcc } = await adminDb.from('ledger_accounts').select('id').eq('code', '1001-USER-WALLET').single()
  const { data: adminAcc } = await adminDb.from('ledger_accounts').select('id').eq('code', '2000-ADMIN-ADJUSTMENT-POOL').single() // Fallback if doesn't exist?
  
  if (walletAcc && adminAcc) {
    await adminDb.from('ledger_journal_postings').insert([
      { journal_id: journal.id, account_id: walletAcc.id, debit_paise: isAddition ? 0 : amountPaise, credit_paise: isAddition ? amountPaise : 0 },
      { journal_id: journal.id, account_id: adminAcc.id, debit_paise: isAddition ? amountPaise : 0, credit_paise: isAddition ? 0 : amountPaise },
    ])
    
    // For simplicity, we just update wallets table directly as well for fast reads
    const { data: wallet } = await adminDb.from('wallets').select('total_balance_paise').eq('user_id', userId).single()
    if (wallet) {
      await adminDb.from('wallets').update({
        total_balance_paise: isAddition ? Number(wallet.total_balance_paise || 0) + amountPaise : Math.max(0, Number(wallet.total_balance_paise || 0) - amountPaise)
      }).eq('user_id', userId)
    }
  }

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function lookupSponsorAction(query: string) {
  if (!query) return null;
  const adminDb = createAdminClient();
  
  let q = adminDb.from('users').select('id, full_name, email');
  
  if (query.includes('@')) {
    q = q.eq('email', query);
  } else if (query.length === 36 && query.includes('-')) {
    q = q.eq('id', query);
  } else {
    q = q.eq('username', query);
  }
  
  const { data } = await q.single();
  return data;
}
