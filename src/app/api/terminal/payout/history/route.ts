import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          }
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Admin client to bypass RLS for grabbing recipient user details
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {}
        }
      }
    );

    // 1. Fetch all payout ledgers for this user
    const { data: payouts, error: payoutsError } = await supabaseAdmin
      .from('payout_exchange_ledger')
      .select('*')
      .eq('trader_user_id', user.id)
      .order('created_at', { ascending: false });

    if (payoutsError) throw new Error(payoutsError.message);

    if (!payouts || payouts.length === 0) {
      return NextResponse.json({ payouts: [] });
    }

    const payoutIds = payouts.map(p => p.payout_request_id);

    // 2. Fetch all related distributions (transactions)
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*, users(full_name, username)')
      .in('reference_id', payoutIds);

    if (txError) throw new Error(txError.message);

    const exchangeRateMap: Record<string, number> = {};
    payouts.forEach(p => {
      exchangeRateMap[p.payout_request_id] = p.exchange_rate || 85;
    });

    // 3. Group transactions by payout request
    const distributionsByPayout: Record<string, any[]> = {};
    if (transactions) {
      transactions.forEach(tx => {
        if (!distributionsByPayout[tx.reference_id]) {
          distributionsByPayout[tx.reference_id] = [];
        }
        
        let formattedType = tx.transaction_type;
        if (formattedType === 'TRADING_INCOME') {
          formattedType = tx.description.includes('Company') ? 'COMPANY_RETAINED' : 'TRADER_SHARE';
        }

        // Parse level from description if applicable
        let level = null;
        const levelMatch = tx.description.match(/Level (\d+)/i);
        if (levelMatch) {
          level = parseInt(levelMatch[1], 10);
        }

        const exchangeRate = exchangeRateMap[tx.reference_id] || 85;
        let amountUsd = (tx.amount_cents || 0) / 100;
        const amountInr = (tx.amount_paise || 0) / 100;

        if (amountUsd === 0 && amountInr > 0) {
          amountUsd = amountInr / exchangeRate;
        }

        distributionsByPayout[tx.reference_id].push({
          id: tx.id,
          recipient_user_id: tx.user_id,
          recipient_name: tx.users?.full_name || 'System',
          recipient_username: tx.users?.username || 'system',
          type: formattedType,
          amount_usd: amountUsd,
          amount_inr: amountInr,
          description: tx.description,
          level: level
        });
      });
    }

    // 4. Assemble payload
    const enrichedPayouts = payouts.map(p => ({
      ...p,
      distributions: distributionsByPayout[p.payout_request_id] || []
    }));

    return NextResponse.json({ payouts: enrichedPayouts });

  } catch (error: any) {
    console.error('Payout History API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
