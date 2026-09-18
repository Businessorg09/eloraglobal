import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: withdrawals, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'WITHDRAWAL')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
    }

    const formattedWithdrawals = (withdrawals || []).map((w: any) => ({
      ...w,
      amount_inr: w.amount_paise / 100,
    }));

    return NextResponse.json({ withdrawals: formattedWithdrawals });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amountInr, bankName, accountNumber, ifscCode, accountHolderName } = body;

    if (!amountInr || amountInr < 500) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is ₹500' }, { status: 400 });
    }

    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json({ error: 'Missing bank details' }, { status: 400 });
    }

    const amountPaise = Math.floor(amountInr * 100);
    const adminClient = createAdminClient();

    // Check balance
    const { data: wallet } = await adminClient
      .from('wallets')
      .select('id, total_balance_paise, total_withdrawn_paise')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.total_balance_paise < amountPaise) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Insert pending withdrawal as a transaction with negative amount
    const description = `Withdrawal Request - Bank: ${bankName}, Acc: ${accountNumber}, Status: PENDING`;

    // Note: Deducting balance immediately by increasing total_withdrawn_paise.
    // (If rejected, admin would refund it).
    await adminClient
      .from('wallets')
      .update({
        total_withdrawn_paise: wallet.total_withdrawn_paise + amountPaise,
      })
      .eq('id', wallet.id);

    const { data: transaction, error: txError } = await adminClient
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'WITHDRAWAL',
        amount_paise: -amountPaise,
        description,
        balance_after_paise: wallet.total_balance_paise - amountPaise
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json({ error: 'Failed to submit withdrawal request' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Withdrawal request submitted — pending admin review',
      request: {
        ...transaction,
        amount_inr: transaction.amount_paise / 100,
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
