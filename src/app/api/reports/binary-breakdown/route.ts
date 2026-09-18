import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const payoutId = searchParams.get('payout_id');
    const adminDb = createAdminClient();

    // 1. Get the payout period
    let periodStart: string;
    let periodEnd: string;
    let historyRecord = null;

    if (payoutId) {
      const { data: history } = await adminDb
        .from('binary_commission_history')
        .select('*')
        .eq('id', payoutId)
        .eq('node_id', (await adminDb.from('binary_nodes').select('id').eq('user_id', user.id).single()).data?.id)
        .single();
      if (!history) return NextResponse.json({ error: 'Payout history not found' }, { status: 404 });
      historyRecord = history;
      periodStart = history.period_start;
      periodEnd = history.period_end;
    } else {
      // Default to the most recent one or last 7 days
      const { data: node } = await adminDb.from('binary_nodes').select('id').eq('user_id', user.id).single();
      if (!node) return NextResponse.json({ error: 'Binary node not found' }, { status: 404 });
      
      const { data: history } = await adminDb
        .from('binary_commission_history')
        .select('*')
        .eq('node_id', node.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (history) {
        historyRecord = history;
        periodStart = history.period_start;
        periodEnd = history.period_end;
      } else {
        const d = new Date();
        periodEnd = d.toISOString().split('T')[0];
        d.setDate(d.getDate() - 90); // Expand default to 90 days if no history exists yet so they see *some* data
        periodStart = d.toISOString().split('T')[0];
      }
    }

    // Get all available history periods for the dropdown
    const { data: allHistory } = await adminDb
      .from('binary_commission_history')
      .select('id, period_start, period_end, matched_bv, created_at')
      .eq('node_id', (await adminDb.from('binary_nodes').select('id').eq('user_id', user.id).single()).data?.id)
      .order('created_at', { ascending: false });

    const availablePeriods = (allHistory || []).map((h: any) => ({
      id: h.id,
      label: `Week of ${h.period_start} to ${h.period_end} (${h.matched_bv} BV)`
    }));

    if (availablePeriods.length === 0) {
      // If no payouts yet, just add a default "Last 90 Days" option
      availablePeriods.push({
        id: 'default',
        label: `Last 90 Days (${periodStart} - ${periodEnd})`
      });
    }

    // 2. Get User's Binary Node and Children
    const { data: node } = await adminDb.from('binary_nodes').select('id, user_id').eq('user_id', user.id).single();
    if (!node) return NextResponse.json({ leftContributors: [], rightContributors: [], history: historyRecord });

    const { data: children } = await adminDb.from('binary_nodes').select('id, user_id, position').eq('parent_id', node.id);
    const leftChild = children?.find(c => c.position === 'L');
    const rightChild = children?.find(c => c.position === 'R');

    // Helper to get all userIds in a subtree
    const getSubtreeUsers = async (childNode: any) => {
      if (!childNode) return [];
      const sanitizedId = childNode.user_id.replace(/-/g, '_');
      // Find all nodes whose path contains the child's sanitized ID
      // This works perfectly because UUIDs are globally unique
      const { data: nodes } = await adminDb
        .from('binary_nodes')
        .select('user_id')
        .like('path', `%${sanitizedId}%`);
      
      return (nodes || []).map(n => n.user_id);
    };

    const leftUserIds = await getSubtreeUsers(leftChild);
    const rightUserIds = await getSubtreeUsers(rightChild);

    // 3. Fetch BV Generating Transactions in period
    // Assuming PACKAGE_PURCHASE and UPGRADE generate BV.
    // For this report, we'll look at all transactions of these types, joining with user data.
    const getContributors = async (userIds: string[]) => {
      if (userIds.length === 0) return [];
      
      const { data: txs } = await adminDb
        .from('transactions')
        .select(`
          id,
          created_at,
          amount_paise,
          description,
          transaction_type,
          user_id,
          users!inner(username, email)
        `)
        .in('transaction_type', ['PACKAGE_PURCHASE', 'UPGRADE', 'REACTIVATION'])
        .in('user_id', userIds)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd + 'T23:59:59.999Z')
        .order('created_at', { ascending: false });

      if (!txs) return [];

      return txs.map((tx: any) => ({
        id: tx.id,
        user_id: tx.user_id,
        username: tx.users?.username || 'Unknown',
        email: tx.users?.email || 'Unknown',
        date: tx.created_at,
        amount_paise: tx.amount_paise,
        type: tx.transaction_type,
        description: tx.description,
        // Estimate BV (typically package price / 48.25 or similar based on business rules)
        // For starter: 4825 INR -> 100 BV. So BV = amount_paise / 100 / 48.25
        estimated_bv: Math.floor((tx.amount_paise / 100) / 48.25)
      }));
    };

    const leftContributors = await getContributors(leftUserIds);
    const rightContributors = await getContributors(rightUserIds);

    return NextResponse.json({
      success: true,
      periodStart,
      periodEnd,
      history: historyRecord,
      availablePeriods,
      leftContributors,
      rightContributors,
      stats: {
        leftTotalBv: leftContributors.reduce((s: any, c: any) => s + c.estimated_bv, 0),
        rightTotalBv: rightContributors.reduce((s: any, c: any) => s + c.estimated_bv, 0),
      }
    });

  } catch (error: any) {
    console.error('Binary Breakdown API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
