import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: txId } = await params;
    const body = await req.json();
    const { status } = body; // 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: tx, error: txError } = await adminClient
      .from('transactions')
      .select('*')
      .eq('id', txId)
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (!tx.description?.includes('PENDING')) {
      return NextResponse.json({ error: 'Withdrawal is not in PENDING state' }, { status: 400 });
    }

    let newDescription = tx.description.replace('PENDING', status);

    if (status === 'REJECTED') {
      // Refund the amount
      const amountPaiseToRefund = Math.abs(tx.amount_paise);
      
      const { data: wallet } = await adminClient
        .from('wallets')
        .select('id, total_withdrawn_paise')
        .eq('user_id', tx.user_id)
        .single();
        
      if (wallet) {
        await adminClient.from('wallets').update({
          total_withdrawn_paise: wallet.total_withdrawn_paise - amountPaiseToRefund
        }).eq('id', wallet.id);
      }
    }

    await adminClient.from('transactions').update({
      description: newDescription
    }).eq('id', txId);

    return NextResponse.json({ success: true, status, description: newDescription });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
