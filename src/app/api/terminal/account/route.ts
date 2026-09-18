import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    // Fetch user's latest trading account safely
    const { data: accounts, error: accountError } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (accountError) {
      throw accountError;
    }

    const account = accounts && accounts.length > 0 ? accounts[0] : null;

    if (!account) {
      return NextResponse.json({ account: null, trades: [] });
    }

    // Fetch associated trades
    const { data: trades, error: tradesError } = await supabase
      .from('broker_trades')
      .select('*')
      .eq('account_id', account.id)
      .order('open_time', { ascending: false });

    if (tradesError) throw tradesError;

    return NextResponse.json({ account, trades });
  } catch (error: any) {
    console.error('Terminal Account GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
