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

    const adminDb = createAdminClient();

    const { data: node, error: nodeError } = await adminDb
      .from('binary_nodes')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (nodeError || !node) {
      return NextResponse.json({ history: [] }); // No node yet
    }

    // Fetch the binary commission history using adminDb to bypass RLS
    const { data: history, error: historyError } = await adminDb
      .from('binary_commission_history')
      .select('*')
      .eq('node_id', node.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) {
      return NextResponse.json({ error: 'Failed to fetch binary history' }, { status: 500 });
    }

    // Format money values to INR
    const formattedHistory = (history || []).map((h: any) => ({
      ...h,
      raw_income_inr: h.raw_income_paise / 100,
      capped_income_inr: h.capped_income_paise != null ? h.capped_income_paise / 100 : null,
      cycle_limited_income_inr: h.cycle_limited_income_paise != null ? h.cycle_limited_income_paise / 100 : null,
      final_income_inr: h.final_income_paise / 100,
      weekly_cap_at_time_inr: h.weekly_cap_at_time_paise != null ? h.weekly_cap_at_time_paise / 100 : null,
    }));

    return NextResponse.json({ history: formattedHistory });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
