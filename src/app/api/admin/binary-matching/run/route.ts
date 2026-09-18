import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { calculateBinaryMatch } from '@/lib/engines/binary-matching.engine'
import { calculateMilestoneBonuses } from '@/lib/engines/matching-milestone.engine'

export async function POST() {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate that caller is an Admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: adminUser, error: adminCheckError } = await adminDb
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminCheckError || adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 })
    }

    // 2. Fetch all active binary nodes sorted by depth descending (bottom-up execution)
    const { data: nodes, error: nodesError } = await adminDb
      .from('binary_nodes')
      .select(`
        id, 
        user_id,
        depth,
        binary_node_volumes (
          left_bv,
          right_bv,
          left_bv_carryover,
          right_bv_carryover,
          total_binary_income_earned_paise,
          binary_income_limit_paise,
          is_binary_earning_active
        ),
        users!inner (
          created_at,
          user_ranks (
            current_rank,
            weekly_binary_cap_paise
          )
        )
      `)
      .eq('is_active', true)
      .order('depth', { ascending: false })

    if (nodesError || !nodes) {
      return NextResponse.json({ error: `Failed to fetch nodes: ${nodesError?.message}` }, { status: 500 })
    }

    let disbursedAmount = 0;
    let processedNodes = 0;
    const results: any[] = []
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - 7) // past 7 days
    const periodEnd = new Date()

    // 3. Process each node
    for (const node of nodes) {
      const volume = node.binary_node_volumes as any
      const rank = (node.users as any)?.user_ranks as any
      
      if (!volume || !rank) continue

      // Execute calculation engine
      const matchInput = {
        nodeId: node.id,
        leftBv: volume.left_bv || 0,
        rightBv: volume.right_bv || 0,
        leftBvCarryover: volume.left_bv_carryover || 0,
        rightBvCarryover: volume.right_bv_carryover || 0,
        totalBinaryIncomeEarnedPaise: Number(volume.total_binary_income_earned_paise || 0),
        binaryIncomeLimitPaise: Number(volume.binary_income_limit_paise || 0),
        weeklyBinaryCapPaise: Number(rank.weekly_binary_cap_paise || 2500000),
        isBinaryEarningActive: volume.is_binary_earning_active ?? true,
        lifetimeMatchedPairs: 0,
      }

      const matchResult = calculateBinaryMatch(matchInput)

      if (matchResult.qualified && matchResult.finalIncomePaise > 0) {
        processedNodes++;
        disbursedAmount += matchResult.finalIncomePaise;
        // Update database for the qualified node
        
        // a. Update volumes & carryover
        const { error: updateVolError } = await adminDb
          .from('binary_node_volumes')
          .update({
            left_bv: 0,
            right_bv: 0,
            left_bv_carryover: matchResult.newLeftBvCarryover,
            right_bv_carryover: matchResult.newRightBvCarryover,
            total_binary_income_earned_paise: matchResult.newTotalBinaryIncomeEarnedPaise,
            is_binary_earning_active: !matchResult.isCycleComplete,
            updated_at: new Date().toISOString(),
          })
          .eq('node_id', node.id)

        if (updateVolError) {
          console.error(`Error updating volume for node ${node.id}:`, updateVolError)
          continue
        }

        // b. Record in Commission History
        await adminDb
          .from('binary_commission_history')
          .insert({
            node_id: node.id,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            left_bv_before: matchResult.totalLeftBv,
            right_bv_before: matchResult.totalRightBv,
            matched_bv: matchResult.matchableBv,
            raw_income_paise: matchResult.rawIncomePaise,
            capped_income_paise: matchResult.afterWeeklyCapPaise,
            cycle_limited_income_paise: matchResult.afterCycleLimitPaise,
            final_income_paise: matchResult.finalIncomePaise,
            left_bv_consumed: matchResult.bvConsumed,
            right_bv_consumed: matchResult.bvConsumed,
            left_bv_carryover: matchResult.newLeftBvCarryover,
            right_bv_carryover: matchResult.newRightBvCarryover,
            rank_at_time: rank.current_rank,
            weekly_cap_at_time_paise: rank.weekly_binary_cap_paise,
          })

        // c. Credit wallet
        const { data: currentWallet, error: walletError } = await adminDb
          .from('wallets')
          .select('binary_income_paise')
          .eq('user_id', node.user_id)
          .single()

        if (!walletError && currentWallet) {
          await adminDb
            .from('wallets')
            .update({
              binary_income_paise: Number(currentWallet.binary_income_paise || 0) + matchResult.finalIncomePaise,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', node.user_id)
        }

        // d. Record transactions
        await adminDb
          .from('transactions')
          .insert({
            user_id: node.user_id,
            transaction_type: 'BINARY_INCOME',
            amount_paise: matchResult.finalIncomePaise,
            description: `Weekly binary match commission: ${matchResult.matchedPairs} pairs matched.`,
          })

        // --- SEND NOTIFICATION TO USER ---
        import('@/lib/notifications').then(({ createNotification }) => {
          createNotification(
            node.user_id,
            'Binary Match Commission',
            `Congratulations! You received a binary match commission of ₹${(matchResult.finalIncomePaise / 100).toFixed(2)} for matching ${matchResult.matchedPairs} pairs.`,
            'PAYOUT'
          ).catch(console.error);
        });

        // e. Double-entry ledger journal entry
        const idempotencyKey = `weekly_binary_${node.id}_${periodEnd.toISOString().split('T')[0]}`
        const { data: journal } = await adminDb
          .from('ledger_journals')
          .insert({
            idempotency_key: idempotencyKey,
            reference_type: 'BINARY_PAYOUT',
            description: `Binary payout for user ${node.user_id}`,
          })
          .select()
          .single()

        if (journal) {
          // Fetch ledger accounts to lock their codes
          const { data: expenseAcc } = await adminDb.from('ledger_accounts').select('id').eq('code', '2002-BINARY-PAYOUT-POOL').single()
          const { data: walletAcc } = await adminDb.from('ledger_accounts').select('id').eq('code', '1001-USER-WALLET').single()

          if (expenseAcc && walletAcc) {
            await adminDb.from('ledger_journal_postings').insert([
              { journal_id: journal.id, account_id: expenseAcc.id, debit_paise: matchResult.finalIncomePaise, credit_paise: 0 },
              { journal_id: journal.id, account_id: walletAcc.id, debit_paise: 0, credit_paise: matchResult.finalIncomePaise },
            ])

            // Update ledger account balances cached
            await adminDb.rpc('increment_ledger_balance', { acc_id: expenseAcc.id, amount: matchResult.finalIncomePaise })
            await adminDb.rpc('increment_ledger_balance', { acc_id: walletAcc.id, amount: matchResult.finalIncomePaise })
          }
        }
      }

      // f. Matching Milestone Bonus Processing
      const bonuses = calculateMilestoneBonuses(
        matchInput.lifetimeMatchedPairs,
        matchResult.newLifetimeMatchedPairs || matchInput.lifetimeMatchedPairs,
        (node.users as any)?.created_at || new Date().toISOString()
      );

      for (const bonus of bonuses) {
        // Record History
        await adminDb.from('matching_milestone_history').insert({
          user_id: node.user_id,
          milestone_achieved: bonus.milestone,
          bonus_amount_paise: bonus.amountPaise,
        });

        // Credit Wallet
        const { data: mWallet } = await adminDb.from('wallets').select('milestone_bonus_paise').eq('user_id', node.user_id).single();
        if (mWallet) {
          await adminDb.from('wallets').update({
            milestone_bonus_paise: Number(mWallet.milestone_bonus_paise || 0) + bonus.amountPaise,
            updated_at: new Date().toISOString(),
          }).eq('user_id', node.user_id);
        }

        // Record Transaction
        await adminDb.from('transactions').insert({
          user_id: node.user_id,
          transaction_type: 'MATCHING_MILESTONE_BONUS',
          amount_paise: bonus.amountPaise,
          description: `Congratulations! ${bonus.milestone} Pairs Matching Milestone Bonus (achieved in ${bonus.daysElapsed} days)`,
        });

        // Double-entry accounting
        const idempotencyKey = `milestone_bonus_${node.id}_${bonus.milestone}`;
        const { data: journal } = await adminDb.from('ledger_journals').insert({
          idempotency_key: idempotencyKey,
          reference_type: 'MILESTONE_PAYOUT',
          description: `Milestone bonus payout for user ${node.user_id}`,
        }).select().single();

        if (journal) {
          const { data: expenseAcc } = await adminDb.from('ledger_accounts').select('id').eq('code', '2007-MILESTONE-BONUS-POOL').single();
          const { data: walletAcc } = await adminDb.from('ledger_accounts').select('id').eq('code', '1001-USER-WALLET').single();

          if (expenseAcc && walletAcc) {
            await adminDb.from('ledger_journal_postings').insert([
              { journal_id: journal.id, account_id: expenseAcc.id, debit_paise: bonus.amountPaise, credit_paise: 0 },
              { journal_id: journal.id, account_id: walletAcc.id, debit_paise: 0, credit_paise: bonus.amountPaise },
            ]);
            await adminDb.rpc('increment_ledger_balance', { acc_id: expenseAcc.id, amount: bonus.amountPaise });
            await adminDb.rpc('increment_ledger_balance', { acc_id: walletAcc.id, amount: bonus.amountPaise });
          }
        }
      }

      results.push({
        nodeId: node.id,
        userId: node.user_id,
        qualified: matchResult.qualified,
        finalIncome: matchResult.finalIncomePaise / 100,
        isCycleComplete: matchResult.isCycleComplete,
        disqualifyReason: matchResult.disqualifyReason,
      })
    }

    return NextResponse.json({
      message: 'Weekly binary matching complete.',
      processedNodes,
      disbursedAmount,
      results,
    })
  } catch (error: any) {
    console.error('Binary Matching API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
