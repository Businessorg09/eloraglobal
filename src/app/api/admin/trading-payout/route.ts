import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateTradingPayoutSplit } from '@/lib/engines/trading-payout.engine';
import { calculateSponsorIncome } from '@/lib/engines/sponsor-income.engine';
import { calculateLeadershipIncome } from '@/lib/engines/leadership-income.engine';

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

    const body = await req.json();
    const { traderUsername, payoutAmountUsdCents, exchangeRateUsdToInr } = body;

    if (!traderUsername || !payoutAmountUsdCents || !exchangeRateUsdToInr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch trader
    const { data: trader, error: traderError } = await adminClient
      .from('users')
      .select('id, referred_by')
      .eq('username', traderUsername)
      .single();

    if (traderError || !trader) {
      return NextResponse.json({ error: 'Trader not found' }, { status: 404 });
    }

    // Fetch trader node
    const { data: traderNode } = await adminClient
      .from('binary_nodes')
      .select('id, path')
      .eq('user_id', trader.id)
      .single();

    const payoutResult = calculateTradingPayoutSplit({
      traderUserId: trader.id,
      payoutAmountUsdCents,
      exchangeRateUsdToInr,
    });

    // Credit trader wallet & transaction
    if (payoutResult.traderSharePaise > 0) {
      // using raw sql or rpc? let's fetch current wallet, then update.
      // it's an admin client, we can fetch and update or use rpc if available. Let's do fetch+update.
      const { data: wallet } = await adminClient.from('wallets').select('id, trading_income_paise, total_balance_paise').eq('user_id', trader.id).single();
      if (wallet) {
          await adminClient.from('wallets').update({
            trading_income_paise: wallet.trading_income_paise + payoutResult.traderSharePaise,
          }).eq('id', wallet.id);

        await adminClient.from('transactions').insert({
          user_id: trader.id,
          amount_paise: payoutResult.traderSharePaise,
          transaction_type: 'TRADING_INCOME',
          description: `Trading payout (USD ${payoutAmountUsdCents / 100})`,
        });
      }
    }

    // Sponsor Chain
    let sponsorDistributionsCount = 0;
    if (payoutResult.sponsorPoolPaise > 0 && trader.referred_by) {
      const sponsorChain = [];
      let currentSponsorId = trader.referred_by;
      for (let i = 1; i <= 10; i++) {
        if (!currentSponsorId) break;
        const { data: sponsor } = await adminClient.from('users').select('id, referred_by, is_active').eq('id', currentSponsorId).single();
        if (!sponsor) break;

        const { data: sponsorNode } = await adminClient.from('binary_nodes').select('is_active').eq('user_id', sponsor.id).single();
        const hasActivePackage = !!(sponsorNode && sponsorNode.is_active);

        sponsorChain.push({
          userId: sponsor.id,
          level: i,
          isActive: sponsor.is_active,
          hasActivePackage,
        });
        currentSponsorId = sponsor.referred_by;
      }

      const sponsorResult = calculateSponsorIncome({
        traderUserId: trader.id,
        sponsorPoolPaise: payoutResult.sponsorPoolPaise,
        sponsorChain,
        exchangeRate: exchangeRateUsdToInr,
        payoutAmountUsdCents,
      });

      for (const dist of sponsorResult.distributions) {
        const { data: wallet } = await adminClient.from('wallets').select('id, sponsor_income_paise, total_balance_paise').eq('user_id', dist.userId).single();
        if (wallet) {
          await adminClient.from('wallets').update({
            sponsor_income_paise: wallet.sponsor_income_paise + dist.amountPaise,
          }).eq('id', wallet.id);

          await adminClient.from('transactions').insert({
            user_id: dist.userId,
            amount_paise: dist.amountPaise,
            transaction_type: 'SPONSOR_INCOME',
            description: `Sponsor income (Level ${dist.level}) from ${traderUsername}`,
          });

          await adminClient.from('sponsor_income_history').insert({
            user_id: dist.userId,
            from_user_id: trader.id,
            level: dist.level,
            amount_paise: dist.amountPaise,
          });
          sponsorDistributionsCount++;
        }
      }
    }

    // Leadership Chain
    let leadershipDistributionsCount = 0;
    if (payoutResult.leadershipPoolPaise > 0 && traderNode?.path) {
      // The instruction says "fetch binary tree upline chain (up to 20 levels) using ltree path: query binary_nodes where path is an ancestor of trader's node, ordered by depth desc, limit 20"
      // Assuming Supabase doesn't natively expose ltree '@>' through auto-generated API, but we can query by path if we split the ltree path string.
      const pathSegments = traderNode.path.split('.');
      const ancestorPaths = [];
      let currentPath = "";
      for (let i = 0; i < pathSegments.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}.${pathSegments[i]}` : pathSegments[i];
        ancestorPaths.push(currentPath);
      }
      // Get up to 20 ancestors, closest first (reverse array)
      const closestPaths = ancestorPaths.reverse().slice(0, 20);

      if (closestPaths.length > 0) {
        const { data: ancestors } = await adminClient.from('binary_nodes').select('user_id, is_active, path').in('path', closestPaths);
        
        if (ancestors && ancestors.length > 0) {
          // Sort by length of path descending (closest to trader)
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
            traderUserId: trader.id,
            leadershipPoolPaise: payoutResult.leadershipPoolPaise,
            binaryUplineChain: leadershipChain,
            exchangeRate: exchangeRateUsdToInr,
            payoutAmountUsdCents,
          });

          for (const dist of leadershipResult.distributions) {
            const { data: wallet } = await adminClient.from('wallets').select('id, leadership_income_paise, total_balance_paise').eq('user_id', dist.userId).single();
            if (wallet) {
              await adminClient.from('wallets').update({
                leadership_income_paise: wallet.leadership_income_paise + dist.amountPaise,
              }).eq('id', wallet.id);

              await adminClient.from('transactions').insert({
                user_id: dist.userId,
                amount_paise: dist.amountPaise,
                transaction_type: 'LEADERSHIP_INCOME',
                description: `Leadership income from ${traderUsername}`,
              });

              await adminClient.from('leadership_income_history').insert({
                user_id: dist.userId,
                from_user_id: trader.id,
                amount_paise: dist.amountPaise,
              });
              leadershipDistributionsCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      traderCredited: payoutResult.traderSharePaise / 100,
      sponsorDistributions: sponsorDistributionsCount,
      leadershipDistributions: leadershipDistributionsCount,
      companyRetained: payoutResult.companySharePaise / 100
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
