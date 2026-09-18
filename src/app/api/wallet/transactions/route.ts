import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('transaction_type', type);
    }

    const { data: transactions, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // Enrich transactions by replacing UUIDs in descriptions with usernames
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const userIdsToFetch = new Set<string>();

    (transactions || []).forEach((tx: any) => {
      if (tx.description) {
        const matches = tx.description.match(uuidRegex);
        if (matches) {
          matches.forEach((match: string) => userIdsToFetch.add(match));
        }
      }
    });

    const userMap: Record<string, string> = {};
    if (userIdsToFetch.size > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, full_name')
        .in('id', Array.from(userIdsToFetch));

      if (usersData) {
        usersData.forEach((u: any) => {
          userMap[u.id] = `${u.full_name} (@${u.username})`;
        });
      }
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const formattedTransactions = (transactions || []).map((tx: any) => {
      let enrichedDescription = tx.description;
      if (enrichedDescription) {
        const matches = enrichedDescription.match(uuidRegex);
        if (matches) {
          matches.forEach((match: string) => {
            if (userMap[match]) {
              enrichedDescription = enrichedDescription.replace(match, userMap[match]);
            }
          });
        }
      }
      return {
        ...tx,
        description: enrichedDescription,
        amount_inr: (tx.amount_paise || 0) / 100,
        amount_inr_paise: tx.amount_paise || 0, // Fallback for the frontend table which incorrectly checks amount_inr_paise
        balance_after_inr: tx.balance_after_paise != null ? tx.balance_after_paise / 100 : null,
      };
    });

    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      page,
      totalPages,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
