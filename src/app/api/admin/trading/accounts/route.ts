import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
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

    // Fetch users with their accounts
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, full_name, email,
        account:trading_accounts(*, broker_trades(*)),
        purchases:package_purchases(payment_gateway_id, packages!package_id(name))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Admin Accounts GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const { user_id, account_number, password, broker_server, balance } = await request.json();

    if (!user_id || !account_number || !password || !broker_server) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if account exists
    const { data: existingAccounts } = await supabase
      .from('trading_accounts')
      .select('id')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1);

    let account;
    let error;

    const existingAccount = existingAccounts && existingAccounts.length > 0 ? existingAccounts[0] : null;

    if (existingAccount) {
      // Update
      const res = await supabase
        .from('trading_accounts')
        .update({
          account_number,
          password,
          broker_server,
          balance: parseFloat(balance) || 0,
          equity: parseFloat(balance) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccount.id)
        .select()
        .single();
      account = res.data;
      error = res.error;
    } else {
      // Insert
      const res = await supabase
        .from('trading_accounts')
        .insert({
          user_id,
          account_number,
          password,
          broker_server,
          balance: parseFloat(balance) || 0,
          equity: parseFloat(balance) || 0,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      account = res.data;
      error = res.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    console.error('Admin Accounts POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
