import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          }
        },
      }
    );

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { account_id, user_id, symbol, direction, lot_size, open_price, close_price, open_time, close_time, pnl, status } = await request.json();

    if (!account_id || !user_id || !symbol || !direction || !lot_size || !open_price || !open_time || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticket_id = `TKT-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;

    // Insert trade
    const { data: trade, error: tradeError } = await supabase
      .from('broker_trades')
      .insert({
        account_id,
        user_id,
        ticket_id,
        symbol,
        direction,
        lot_size: parseFloat(lot_size),
        open_price: parseFloat(open_price),
        close_price: close_price ? parseFloat(close_price) : null,
        open_time,
        close_time: close_time || null,
        pnl: parseFloat(pnl) || 0,
        status
      })
      .select()
      .single();

    if (tradeError) throw tradeError;

    // Update account balance and equity
    // Fetch current account
    const { data: account } = await supabase.from('trading_accounts').select('balance, equity').eq('id', account_id).single();
    
    if (account) {
      // If the trade is closed, we permanently add to balance.
      // If the trade is open, we only add to equity (floating).
      let newBalance = parseFloat(account.balance);
      let newEquity = parseFloat(account.equity);
      
      const parsedPnl = parseFloat(pnl) || 0;

      if (status === 'CLOSED') {
        newBalance += parsedPnl;
        newEquity = newBalance; // Reset equity to balance (ignoring other open trades for this simple simulation)
      } else {
        newEquity += parsedPnl;
      }

      await supabase
        .from('trading_accounts')
        .update({ balance: newBalance, equity: newEquity, updated_at: new Date().toISOString() })
        .eq('id', account_id);
    }

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    console.error('Admin Inject Trade Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
