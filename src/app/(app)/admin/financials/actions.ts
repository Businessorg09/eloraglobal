'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { calculateTradingPayoutSplit } from '@/lib/engines/trading-payout.engine'
import { calculateSponsorIncome } from '@/lib/engines/sponsor-income.engine'
import { calculateLeadershipIncome } from '@/lib/engines/leadership-income.engine'

export async function approveTradingPayoutAction(transactionId: string) {
  const adminClient = createAdminClient()

  // 1. Fetch the pending transaction
  const { data: tx, error: txError } = await adminClient
    .from('transactions')
    .select('*, user:users(id, username, referred_by)')
    .eq('id', transactionId)
    .single()

  if (txError || !tx) throw new Error('Transaction not found')
  if (tx.transaction_type !== 'TRADING_PAYOUT_PENDING') throw new Error('Transaction is not pending')

  // Parse the JSON description to get USD amount and exchange rate
  let payload;
  try {
    payload = JSON.parse(tx.description);
  } catch (e) {
    // If not valid JSON, fallback or throw
    payload = { usdCents: tx.amount_paise, exchangeRate: 95.00 } // Fallback to amount as USD cents
  }

  const payoutAmountUsdCents = payload.usdCents || tx.amount_paise;
  const exchangeRateUsdToInr = payload.exchangeRate || 95.00;

  // 2. Fetch trader node
  const { data: traderNode } = await adminClient
    .from('binary_nodes')
    .select('id, path')
    .eq('user_id', tx.user.id)
    .single()

  const payoutResult = calculateTradingPayoutSplit({
    traderUserId: tx.user.id,
    payoutAmountUsdCents,
    exchangeRateUsdToInr,
  });

  // 3. Mark transaction as APPROVED (change type so it's not pending)
  await adminClient.from('transactions').update({
    transaction_type: 'TRADING_PAYOUT_APPROVED',
    amount_paise: payoutResult.traderSharePaise, // Convert to their INR share
    description: `Trading payout (USD ${payoutAmountUsdCents / 100}) - Approved`
  }).eq('id', tx.id);

  // 4. Credit Trader Wallet
  if (payoutResult.traderSharePaise > 0) {
    const { data: wallet } = await adminClient.from('wallets').select('id, trading_income_paise').eq('user_id', tx.user.id).single();
    if (wallet) {
      await adminClient.from('wallets').update({
        trading_income_paise: Number(wallet.trading_income_paise || 0) + payoutResult.traderSharePaise
      }).eq('id', wallet.id);
    }
  }

  // 5. Distribute Sponsor Pool
  if (payoutResult.sponsorPoolPaise > 0 && tx.user.referred_by) {
    const sponsorChain = [];
    let currentSponsorId = tx.user.referred_by;
    for (let i = 1; i <= 10; i++) {
      if (!currentSponsorId) break;
      const { data: sponsor } = await adminClient.from('users').select('id, referred_by, is_active').eq('id', currentSponsorId).single();
      if (!sponsor) break;

      const { data: sponsorNode } = await adminClient.from('binary_nodes').select('is_active').eq('user_id', sponsor.id).single();
      
      sponsorChain.push({
        userId: sponsor.id,
        level: i,
        isActive: sponsor.is_active,
        hasActivePackage: !!(sponsorNode && sponsorNode.is_active),
      });
      currentSponsorId = sponsor.referred_by;
    }

    const sponsorResult = calculateSponsorIncome({
      traderUserId: tx.user.id,
      sponsorPoolPaise: payoutResult.sponsorPoolPaise,
      sponsorChain,
      exchangeRate: exchangeRateUsdToInr,
      payoutAmountUsdCents,
    });

    for (const dist of sponsorResult.distributions) {
      const { data: wallet } = await adminClient.from('wallets').select('id, sponsor_income_paise').eq('user_id', dist.userId).single();
      if (wallet) {
        await adminClient.from('wallets').update({
          sponsor_income_paise: Number(wallet.sponsor_income_paise || 0) + dist.amountPaise
        }).eq('id', wallet.id);

        await adminClient.from('transactions').insert({
          user_id: dist.userId,
          amount_paise: dist.amountPaise,
          transaction_type: 'SPONSOR_INCOME',
          description: `Sponsor income (Level ${dist.level}) from ${tx.user.username}`,
        });
      }
    }
  }

  // 6. Distribute Leadership Pool
  if (payoutResult.leadershipPoolPaise > 0 && traderNode?.path) {
    const pathSegments = traderNode.path.split('.');
    const ancestorPaths = [];
    let currentPath = "";
    for (let i = 0; i < pathSegments.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}.${pathSegments[i]}` : pathSegments[i];
      ancestorPaths.push(currentPath);
    }
    const closestPaths = ancestorPaths.reverse().slice(0, 20);

    if (closestPaths.length > 0) {
      const { data: ancestors } = await adminClient.from('binary_nodes').select('user_id, is_active, path').in('path', closestPaths);
      
      if (ancestors && ancestors.length > 0) {
        ancestors.sort((a, b) => b.path.length - a.path.length);

        const leadershipChain = await Promise.all(ancestors.map(async (anc, index) => {
          const { data: rank } = await adminClient.from('user_ranks').select('current_rank').eq('user_id', anc.user_id).single();
          return {
            userId: anc.user_id,
            level: index + 1,
            isActive: anc.is_active,
            hasActivePackage: anc.is_active,
            rank: rank?.current_rank || 'UNRANKED'
          };
        }));

        const leadershipResult = calculateLeadershipIncome({
          traderUserId: tx.user.id,
          leadershipPoolPaise: payoutResult.leadershipPoolPaise,
          binaryUplineChain: leadershipChain,
          exchangeRate: exchangeRateUsdToInr,
          payoutAmountUsdCents,
        });

        for (const dist of leadershipResult.distributions) {
          const { data: wallet } = await adminClient.from('wallets').select('id, leadership_income_paise').eq('user_id', dist.userId).single();
          if (wallet) {
            await adminClient.from('wallets').update({
              leadership_income_paise: Number(wallet.leadership_income_paise || 0) + dist.amountPaise
            }).eq('id', wallet.id);

            await adminClient.from('transactions').insert({
              user_id: dist.userId,
              amount_paise: dist.amountPaise,
              transaction_type: 'LEADERSHIP_INCOME',
              description: `Leadership income from ${tx.user.username}`,
            });
          }
        }
      }
    }
  }

  revalidatePath('/admin/financials')
  return { success: true }
}

export async function rejectTradingPayoutAction(transactionId: string) {
  const adminClient = createAdminClient()
  await adminClient.from('transactions').update({
    transaction_type: 'TRADING_PAYOUT_REJECTED',
  }).eq('id', transactionId);
  
  revalidatePath('/admin/financials')
  return { success: true }
}

export async function approveTopupAction(topupId: string) {
  const adminClient = createAdminClient()
  
  // Fetch pending topup
  const { data: topup, error: topupError } = await adminClient
    .from('wallet_topups')
    .select('*')
    .eq('id', topupId)
    .single()
    
  if (topupError || !topup) throw new Error('Top-up request not found')
  if (topup.status !== 'PENDING') throw new Error('Top-up is already processed')
  
  // Mark as APPROVED
  await adminClient.from('wallet_topups').update({ status: 'APPROVED', updated_at: new Date().toISOString() }).eq('id', topupId)
  
  // Add balance to wallet (Skipped total_balance_paise because it's a generated column, topups are calculated dynamically in balance API)
  const { data: wallet } = await adminClient.from('wallets').select('id').eq('user_id', topup.user_id).maybeSingle()
  if (!wallet) {
    await adminClient.from('wallets').insert({
      user_id: topup.user_id,
      binary_income_paise: 0,
      trading_income_paise: 0,
      sponsor_income_paise: 0,
      leadership_income_paise: 0,
      rank_bonus_paise: 0,
      total_withdrawn_paise: 0
    })
  }
  
  // Record Transaction
  await adminClient.from('transactions').insert({
    user_id: topup.user_id,
    amount_paise: topup.amount_paise,
    transaction_type: 'WALLET_TOPUP',
    description: `Approved Manual Topup (UTR: ${topup.transaction_reference})`
  })
  
  revalidatePath('/admin/financials')
  return { success: true }
}

export async function rejectTopupAction(topupId: string) {
  const adminClient = createAdminClient()
  await adminClient.from('wallet_topups').update({ status: 'REJECTED', updated_at: new Date().toISOString() }).eq('id', topupId)
  revalidatePath('/admin/financials')
  return { success: true }
}
