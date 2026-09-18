import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateBinaryMatch } from '@/lib/engines/binary-matching.engine';
import { calculateMilestoneBonuses } from '@/lib/engines/matching-milestone.engine';
import { evaluateRank } from '@/lib/engines/rank.engine';
import { RankKey } from '@/lib/constants/ranks';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();
    
    // Fetch all active binary nodes
    const { data: nodes, error: nodesError } = await adminClient
      .from('binary_nodes')
      .select(`
        id,
        user_id,
        is_active,
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
          full_name,
          email,
          created_at,
          user_ranks (
            weekly_binary_cap_paise,
            current_rank
          )
        )
      `)
      .eq('is_active', true);
      
    if (nodesError) {
      return NextResponse.json({ error: 'Error fetching nodes', details: nodesError.message }, { status: 500 });
    }

    // Fetch users for rank evaluation
    const { data: rankUsers, error: ranksError } = await adminClient
      .from('user_ranks')
      .select(`
        user_id,
        current_rank,
        active_direct_count,
        weekly_binary_cap_paise,
        silver_bonus_claimed,
        gold_bonus_claimed,
        platinum_bonus_claimed,
        diamond_bonus_claimed,
        crown_bonus_claimed,
        ambassador_bonus_claimed,
        users!inner (
          full_name,
          email,
          binary_nodes (
            binary_node_volumes (
              left_lifetime_rank_bv,
              right_lifetime_rank_bv
            )
          )
        )
      `);

    if (ranksError) {
      return NextResponse.json({ error: 'Error fetching ranks', details: ranksError.message }, { status: 500 });
    }

    let totalActiveNodes = nodes?.length || 0;
    let totalQualifiedNodes = 0;
    let totalBinaryPayoutPaise = 0;
    let totalBvConsumed = 0;
    let totalMilestoneBonusPaise = 0;
    let totalRankBonusPaise = 0;
    let grandTotalPayoutPaise = 0;

    const binaryMatchingLedger: any[] = [];
    const milestoneLedger: any[] = [];
    const rankLedger: any[] = [];

    // Process binary nodes
    for (const node of nodes || []) {
      // Handle array or single object from supabase depending on the relationship
      const vol = Array.isArray(node.binary_node_volumes) ? node.binary_node_volumes[0] : ((node.binary_node_volumes as any) || {});
      const usr = Array.isArray(node.users) ? node.users[0] : ((node.users as any) || {});
      // user_ranks is nested inside users now
      const rnk = Array.isArray(usr.user_ranks) ? usr.user_ranks[0] : (usr.user_ranks || {});

      if (!usr.full_name) continue; // safety check if users table didn't join

      // 4. Binary Match
      const totalBinaryIncomeEarned = Number(vol.total_binary_income_earned_paise || 0);
      const binaryIncomeLimit = Number(vol.binary_income_limit_paise || 0);
      const isBinaryEarningActive = vol.is_binary_earning_active !== false;
      const matchResult = calculateBinaryMatch({
        nodeId: node.id,
        leftBv: vol.left_bv || 0,
        rightBv: vol.right_bv || 0,
        leftBvCarryover: vol.left_bv_carryover || 0,
        rightBvCarryover: vol.right_bv_carryover || 0,
        totalBinaryIncomeEarnedPaise: totalBinaryIncomeEarned,
        binaryIncomeLimitPaise: binaryIncomeLimit,
        weeklyBinaryCapPaise: Number(rnk?.weekly_binary_cap_paise || 2500000),
        isBinaryEarningActive,
        lifetimeMatchedPairs: 0
      });

      if (matchResult.qualified) {
        totalQualifiedNodes++;
      }

      totalBinaryPayoutPaise += matchResult.finalIncomePaise;
      totalBvConsumed += matchResult.bvConsumed;

      binaryMatchingLedger.push({
        userId: node.user_id,
        userName: usr.full_name,
        userEmail: usr.email,
        rank: rnk?.current_rank || 'UNKNOWN',
        leftBv: vol.left_bv || 0,
        rightBv: vol.right_bv || 0,
        leftCarryover: vol.left_bv_carryover || 0,
        rightCarryover: vol.right_bv_carryover || 0,
        totalLeftBv: matchResult.totalLeftBv,
        totalRightBv: matchResult.totalRightBv,
        weakerSide: matchResult.weakerSide,
        strongerSide: matchResult.strongerSide,
        weakerSidePct: matchResult.weakerSidePercent,
        matchableBv: matchResult.matchableBv,
        matchedPairs: matchResult.matchedPairs,
        rawIncomePaise: matchResult.rawIncomePaise,
        afterWeeklyCapPaise: matchResult.afterWeeklyCapPaise,
        afterCycleLimitPaise: matchResult.afterCycleLimitPaise,
        finalIncomePaise: matchResult.finalIncomePaise,
        bvConsumed: matchResult.bvConsumed,
        newLeftCarryover: matchResult.newLeftBvCarryover,
        newRightCarryover: matchResult.newRightBvCarryover,
        isCycleComplete: matchResult.isCycleComplete,
        qualified: matchResult.qualified,
        disqualifyReason: matchResult.disqualifyReason || null
      });

      // 5. Milestone
      if (matchResult.matchedPairs > 0) {
        const joinDateStr = usr.created_at ? usr.created_at : new Date().toISOString();
        const milestones = calculateMilestoneBonuses(
          0,
          matchResult.newLifetimeMatchedPairs,
          joinDateStr
        );

        for (const ms of milestones) {
          totalMilestoneBonusPaise += ms.amountPaise;
          milestoneLedger.push({
            userId: node.user_id,
            userName: usr.full_name,
            userEmail: usr.email,
            currentLifetimePairs: 0,
            newLifetimePairs: matchResult.newLifetimeMatchedPairs,
            daysElapsed: ms.daysElapsed,
            milestoneHit: ms.milestone,
            bonusPaise: ms.amountPaise
          });
        }
      }
    }

    // 6. Process Ranks
    for (const ru of rankUsers || []) {
      const usr = Array.isArray(ru.users) ? ru.users[0] : ((ru.users as any) || {});
      
      // Get lifetime rank BV from binary_node_volumes (nested via users → binary_nodes → binary_node_volumes)
      const binNodes = Array.isArray(usr.binary_nodes) ? usr.binary_nodes : [usr.binary_nodes].filter(Boolean);
      const binVol = binNodes.length > 0
        ? (Array.isArray(binNodes[0]?.binary_node_volumes) ? binNodes[0].binary_node_volumes[0] : binNodes[0]?.binary_node_volumes)
        : null;
      const leftRankBv = Number(binVol?.left_lifetime_rank_bv || 0);
      const rightRankBv = Number(binVol?.right_lifetime_rank_bv || 0);

      // Build bonusesClaimed from individual boolean columns
      const bonusesClaimed: Record<string, boolean> = {
        SILVER: ru.silver_bonus_claimed || false,
        GOLD: ru.gold_bonus_claimed || false,
        PLATINUM: ru.platinum_bonus_claimed || false,
        DIAMOND: ru.diamond_bonus_claimed || false,
        CROWN: ru.crown_bonus_claimed || false,
        AMBASSADOR: ru.ambassador_bonus_claimed || false,
      };

      const rankResult = evaluateRank({
        userId: ru.user_id,
        leftLifetimeRankBv: leftRankBv,
        rightLifetimeRankBv: rightRankBv,
        activeDirectCount: ru.active_direct_count || 0,
        currentRank: (ru.current_rank as RankKey) || 'BRONZE',
        bonusesClaimed: bonusesClaimed as Record<RankKey, boolean>
      });

      // Always add to ledger (promotion or not) so admin can see everyone's rank status
      let rbPaise = 0;
      rankResult.bonusesToAward.forEach(b => { rbPaise += b.amountPaise; });
      if (rankResult.isPromotion) totalRankBonusPaise += rbPaise;

      rankLedger.push({
        userId: ru.user_id,
        userName: usr.full_name,
        userEmail: usr.email,
        previousRank: rankResult.previousRank,
        newRank: rankResult.newRank,
        qualificationBv: rankResult.qualificationBv,
        activeDirectCount: ru.active_direct_count || 0,
        isPromotion: rankResult.isPromotion,
        rankBonusPaise: rbPaise,
        rankBonusDetails: rankResult.bonusesToAward
      });
    }

    grandTotalPayoutPaise = totalBinaryPayoutPaise + totalMilestoneBonusPaise + totalRankBonusPaise;

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 7); 

    const response = {
      generatedAt: new Date().toISOString(),
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      summary: {
        totalActiveNodes,
        totalQualifiedNodes,
        totalBinaryPayoutPaise,
        totalBvConsumed,
        totalMilestoneBonusPaise,
        totalRankBonusPaise,
        grandTotalPayoutPaise
      },
      binaryMatchingLedger,
      milestoneLedger,
      rankLedger
    };

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
