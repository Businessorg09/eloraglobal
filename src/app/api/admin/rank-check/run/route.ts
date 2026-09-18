import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { evaluateRank } from '@/lib/engines/rank.engine';
import { RankKey } from '@/lib/constants/ranks';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let targetUserId = null;
    try {
      const body = await req.json();
      targetUserId = body.userId;
    } catch (e) {
      // Body is optional
    }

    const adminClient = createAdminClient();

    let query = adminClient.from('user_ranks').select('*');
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: userRanks, error: userRanksError } = await query;
    if (userRanksError || !userRanks) {
      return NextResponse.json({ error: 'Failed to fetch user ranks' }, { status: 500 });
    }

    let processed = 0;
    let promoted = 0;
    let bonusesAwarded = 0;
    const details = [];

    for (const ur of userRanks) {
      const userId = ur.user_id;

      // Fetch binary node and volumes
      const { data: node } = await adminClient
        .from('binary_nodes')
        .select('id, binary_node_volumes(left_lifetime_rank_bv, right_lifetime_rank_bv)')
        .eq('user_id', userId)
        .single();

      if (!node) continue; // No binary node yet

      const volumes = (node as any).binary_node_volumes || {};
      const leftBv = Number(volumes.left_lifetime_rank_bv || 0);
      const rightBv = Number(volumes.right_lifetime_rank_bv || 0);

      const bonusesClaimed: Record<RankKey, boolean> = {
        STARTER: true,
        LAUNCH: true,
        BRONZE: true, // Bronze has no bonus
        SILVER: !!ur.silver_bonus_claimed,
        GOLD: !!ur.gold_bonus_claimed,
        PLATINUM: !!ur.platinum_bonus_claimed,
        DIAMOND: !!ur.diamond_bonus_claimed,
        CROWN: !!ur.crown_bonus_claimed,
        AMBASSADOR: !!ur.ambassador_bonus_claimed,
      };

      const result = evaluateRank({
        userId,
        leftLifetimeRankBv: leftBv,
        rightLifetimeRankBv: rightBv,
        activeDirectCount: ur.active_direct_count || 0,
        currentRank: (ur.current_rank as RankKey) || 'STARTER',
        bonusesClaimed,
      });

      processed++;

      const updates: any = {};
      if (result.isPromotion) {
        updates.current_rank = result.newRank;
        updates.weekly_binary_cap_paise = result.newWeeklyCapPaise;
        updates.rank_achieved_at = new Date().toISOString();
        promoted++;
      }

      if (result.bonusesToAward && result.bonusesToAward.length > 0) {
        // Fetch wallet
        const { data: wallet } = await adminClient
          .from('wallets')
          .select('id, rank_bonus_paise, total_balance_paise')
          .eq('user_id', userId)
          .single();

        if (wallet) {
          let totalBonusAmount = 0;
          for (const bonus of result.bonusesToAward) {
            totalBonusAmount += bonus.amountPaise;
            const fieldName = `${bonus.rank.toLowerCase()}_bonus_claimed`;
            updates[fieldName] = true;
            bonusesAwarded++;

            await adminClient.from('transactions').insert({
              user_id: userId,
              transaction_type: 'RANK_BONUS',
              amount_paise: bonus.amountPaise,
              description: `${bonus.rank} Rank Achievement Bonus`,
            });
          }

          // Update wallet
          await adminClient.from('wallets').update({
            rank_bonus_paise: wallet.rank_bonus_paise + totalBonusAmount,
          }).eq('id', wallet.id);
        }
      }

      // If updates, apply to user_ranks
      if (Object.keys(updates).length > 0) {
        await adminClient.from('user_ranks').update(updates).eq('user_id', userId);
        
        details.push({
          userId,
          previousRank: result.previousRank,
          newRank: result.newRank,
          isPromotion: result.isPromotion,
          bonusesAwarded: result.bonusesToAward.map(b => b.rank),
        });
      }
    }

    return NextResponse.json({
      processed,
      promoted,
      bonusesAwarded,
      details,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
