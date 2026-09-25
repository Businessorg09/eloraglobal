import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * Daily check-schedule cron (fires once per day via vercel.json).
 * Reads saved schedule from platform_settings and runs binary matching
 * if today's weekday and time match the configured closing day/time.
 */
export async function GET() {
  try {
    const adminDb = createAdminClient()

    // Fetch saved schedule
    const { data: row } = await adminDb
      .from('platform_settings')
      .select('value')
      .eq('key', 'cron_schedule')
      .maybeSingle()

    const schedule = row?.value
      ? JSON.parse(row.value as string)
      : { closingDay: 'SUNDAY', closingTime: '23:59' }

    // Get current IST weekday
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const todayName = dayNames[nowIST.getDay()]
    const currentTime = `${String(nowIST.getHours()).padStart(2, '0')}:${String(nowIST.getMinutes()).padStart(2, '0')}`

    console.log(`[CheckSchedule] Today: ${todayName} ${currentTime} IST | Configured: ${schedule.closingDay} ${schedule.closingTime}`)

    // Check if today matches the configured closing day & time (within a 5-minute window)
    if (todayName !== schedule.closingDay) {
      return NextResponse.json({ fired: false, reason: `Today is ${todayName}, scheduled for ${schedule.closingDay}` })
    }

    // Note: Vercel Cron hits this exactly once a day based on vercel.json (18:00 UTC / 23:30 IST).
    // We ignore the specific configured time from the DB because Vercel's free tier only permits daily crons.
    // As long as the DAY matches, we execute the payout.

    // ✅ Fire the binary matching cron
    console.log('[CheckSchedule] Firing binary matching cron...')
    
    // Dynamically import and call the binary matching logic directly
    // to avoid going through HTTP auth layer
    const { calculateBinaryMatch } = await import('@/lib/engines/binary-matching.engine')
    const { calculateMilestoneBonuses } = await import('@/lib/engines/matching-milestone.engine')

    const { data: nodes } = await adminDb
      .from('binary_nodes')
      .select(`
        id, user_id, depth,
        binary_node_volumes (
          left_bv, right_bv, left_bv_carryover, right_bv_carryover,
          total_binary_income_earned_paise, binary_income_limit_paise,
          is_binary_earning_active
        ),
        users!inner ( created_at, user_ranks ( current_rank, weekly_binary_cap_paise ) )
      `)
      .eq('is_active', true)
      .order('depth', { ascending: false })

    let disbursedAmount = 0
    let processedNodes = 0
    const periodStart = new Date(); periodStart.setDate(periodStart.getDate() - 7)
    const periodEnd = new Date()

    for (const node of (nodes || [])) {
      const volume = node.binary_node_volumes as any
      const rank = (node.users as any)?.user_ranks as any
      if (!volume || !rank) continue

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
        processedNodes++
        disbursedAmount += matchResult.finalIncomePaise

        await adminDb.from('binary_node_volumes').update({
          left_bv: 0, right_bv: 0,
          left_bv_carryover: matchResult.newLeftBvCarryover,
          right_bv_carryover: matchResult.newRightBvCarryover,
          total_binary_income_earned_paise: matchResult.newTotalBinaryIncomeEarnedPaise,
          is_binary_earning_active: !matchResult.isCycleComplete,
          updated_at: new Date().toISOString(),
        }).eq('node_id', node.id)

        await adminDb.from('binary_commission_history').insert({
          node_id: node.id,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          left_bv_before: matchResult.totalLeftBv, right_bv_before: matchResult.totalRightBv,
          matched_bv: matchResult.matchableBv, raw_income_paise: matchResult.rawIncomePaise,
          capped_income_paise: matchResult.afterWeeklyCapPaise,
          cycle_limited_income_paise: matchResult.afterCycleLimitPaise,
          final_income_paise: matchResult.finalIncomePaise,
          left_bv_consumed: matchResult.bvConsumed, right_bv_consumed: matchResult.bvConsumed,
          left_bv_carryover: matchResult.newLeftBvCarryover,
          right_bv_carryover: matchResult.newRightBvCarryover,
          rank_at_time: rank.current_rank,
          weekly_cap_at_time_paise: rank.weekly_binary_cap_paise,
        })

        const { data: wallet } = await adminDb.from('wallets').select('binary_income_paise').eq('user_id', node.user_id).single()
        if (wallet) {
          await adminDb.from('wallets').update({
            binary_income_paise: Number(wallet.binary_income_paise || 0) + matchResult.finalIncomePaise,
            updated_at: new Date().toISOString(),
          }).eq('user_id', node.user_id)
        }

        await adminDb.from('transactions').insert({
          user_id: node.user_id,
          transaction_type: 'BINARY_INCOME',
          amount_paise: matchResult.finalIncomePaise,
          description: `Auto weekly binary match: ${matchResult.matchedPairs} pairs matched.`,
        })
      }

      // Milestone bonuses
      const bonuses = calculateMilestoneBonuses(
        matchInput.lifetimeMatchedPairs,
        matchResult.newLifetimeMatchedPairs || matchInput.lifetimeMatchedPairs,
        (node.users as any)?.created_at || new Date().toISOString()
      )
      for (const bonus of bonuses) {
        await adminDb.from('matching_milestone_history').insert({
          user_id: node.user_id, milestone_achieved: bonus.milestone, bonus_amount_paise: bonus.amountPaise,
        })
        const { data: mw } = await adminDb.from('wallets').select('milestone_bonus_paise').eq('user_id', node.user_id).single()
        if (mw) {
          await adminDb.from('wallets').update({
            milestone_bonus_paise: Number(mw.milestone_bonus_paise || 0) + bonus.amountPaise,
            updated_at: new Date().toISOString(),
          }).eq('user_id', node.user_id)
        }
        await adminDb.from('transactions').insert({
          user_id: node.user_id, transaction_type: 'MATCHING_MILESTONE_BONUS',
          amount_paise: bonus.amountPaise,
          description: `Auto milestone bonus: ${bonus.milestone} pairs in ${bonus.daysElapsed} days.`,
        })
        disbursedAmount += bonus.amountPaise
      }
    }

    // Record last run
    await adminDb.from('platform_settings').upsert({
      key: 'cron_last_run',
      value: JSON.stringify({ timestamp: new Date().toISOString(), processedNodes, disbursedAmount }),
    }, { onConflict: 'key' })

    console.log(`[CheckSchedule] ✅ Cron fired. Nodes: ${processedNodes}, Disbursed: ${disbursedAmount}`)

    return NextResponse.json({
      fired: true,
      processedNodes,
      disbursedAmount,
      message: 'Weekly binary cron executed successfully via auto-schedule.',
    })
  } catch (error: any) {
    console.error('[CheckSchedule] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
