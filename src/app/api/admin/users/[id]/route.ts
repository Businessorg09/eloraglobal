import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const adminClient = createAdminClient();

    const [userReq, rankReq, nodeReq, walletReq, txReq] = await Promise.all([
      adminClient.from('users').select('*').eq('id', targetUserId).single(),
      adminClient.from('user_ranks').select('*').eq('user_id', targetUserId).single(),
      adminClient.from('binary_nodes').select('*, binary_node_volumes(*)').eq('user_id', targetUserId).single(),
      adminClient.from('wallets').select('*').eq('user_id', targetUserId).single(),
      adminClient.from('transactions').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }).limit(10),
    ]);

    if (userReq.error || !userReq.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: userReq.data,
      rank: rankReq.data || null,
      binary_node: nodeReq.data || null,
      wallet: walletReq.data ? {
        ...walletReq.data,
        binary_income_inr: walletReq.data.binary_income_paise / 100,
        trading_income_inr: walletReq.data.trading_income_paise / 100,
        sponsor_income_inr: walletReq.data.sponsor_income_paise / 100,
        leadership_income_inr: walletReq.data.leadership_income_paise / 100,
        rank_bonus_inr: walletReq.data.rank_bonus_paise / 100,
        total_balance_inr: walletReq.data.total_balance_paise / 100,
        total_withdrawn_inr: walletReq.data.total_withdrawn_paise / 100,
      } : null,
      recent_transactions: (txReq.data || []).map(tx => ({
        ...tx,
        amount_inr: tx.amount_paise / 100
      })),
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const body = await req.json();
    const { action } = body;

    const adminClient = createAdminClient();

    if (action === 'TOGGLE_ACTIVE') {
      const { data: targetUser } = await adminClient.from('users').select('is_active').eq('id', targetUserId).single();
      if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const newStatus = !targetUser.is_active;
      await adminClient.from('users').update({ is_active: newStatus }).eq('id', targetUserId);
      return NextResponse.json({ success: true, is_active: newStatus });
    } 
    else if (action === 'FORCE_RANK_CHECK') {
      // In a real app we might call the rank-check logic directly here
      // but the prompt suggests rank check logic is in the other file, 
      // we can do a fetch to the rank-check route or just say success if we trigger it another way.
      // We will trigger a POST request to our own API.
      
      const baseUrl = req.url.split('/api/')[0];
      const res = await fetch(`${baseUrl}/api/admin/rank-check/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cookie': req.headers.get('cookie') || ''
        },
        body: JSON.stringify({ userId: targetUserId })
      });
      
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
