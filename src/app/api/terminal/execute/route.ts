import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role since RLS is disabled for simulation
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          }
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'OPEN') {
      const { account_id, symbol, direction, lot_size, open_price } = body;
      
      if (!account_id || !symbol || !direction || !lot_size || !open_price) {
        return NextResponse.json({ error: 'Missing required fields for OPEN' }, { status: 400 });
      }

      const ticket_id = `TKT-${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
      
      const { data: trade, error } = await supabase
        .from('broker_trades')
        .insert({
          account_id,
          user_id: user.id,
          ticket_id,
          symbol,
          direction,
          lot_size: parseFloat(lot_size),
          open_price: parseFloat(open_price),
          open_time: new Date().toISOString(),
          status: 'OPEN',
          pnl: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ success: true, trade });
    } 
    
    if (action === 'CLOSE') {
      const { trade_id, account_id, close_price, pnl } = body;

      if (!trade_id || !account_id || !close_price || pnl === undefined) {
        return NextResponse.json({ error: 'Missing required fields for CLOSE' }, { status: 400 });
      }

      // Close the trade
      const { data: trade, error } = await supabase
        .from('broker_trades')
        .update({
          close_price: parseFloat(close_price),
          close_time: new Date().toISOString(),
          pnl: parseFloat(pnl),
          status: 'CLOSED'
        })
        .eq('id', trade_id)
        .eq('user_id', user.id) // security check
        .select()
        .single();

      if (error) throw error;

      // Update account balance
      const { data: account } = await supabase
        .from('trading_accounts')
        .select('balance')
        .eq('id', account_id)
        .single();

      if (account) {
        const newBalance = parseFloat(account.balance) + parseFloat(pnl);
        await supabase
          .from('trading_accounts')
          .update({ balance: newBalance, equity: newBalance, updated_at: new Date().toISOString() })
          .eq('id', account_id);
      }

      return NextResponse.json({ success: true, trade });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Terminal Execute Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
