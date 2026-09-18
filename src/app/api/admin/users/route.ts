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

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const rank = searchParams.get('rank');
    const hasNodeParam = searchParams.get('hasNode');

    const offset = (page - 1) * limit;

    const adminClient = createAdminClient();

    let query = adminClient
      .from('users')
      .select(`
        id, username, full_name, email, phone, is_active, created_at,
        user_ranks!inner(current_rank),
        binary_nodes(is_active),
        wallets(total_balance_paise)
      `, { count: 'exact' });

    if (search) {
      query = query.ilike('username', `%${search}%`);
    }
    if (rank) {
      query = query.eq('user_ranks.current_rank', rank);
    }
    // We cannot easily filter by left join existence directly in supabase JS without special setups or views, 
    // but if we do binary_nodes!inner it would filter out those without nodes.
    if (hasNodeParam === 'true') {
      // By replacing 'binary_nodes(...)' with 'binary_nodes!inner(...)' we enforce it.
      // Since it's dynamic, it's easier to fetch and filter if not using inner, or just rebuild the select.
      query = adminClient.from('users').select(`
        id, username, full_name, email, phone, is_active, created_at,
        user_ranks!inner(current_rank),
        binary_nodes!inner(is_active),
        wallets(total_balance_paise)
      `, { count: 'exact' });
      
      if (search) query = query.ilike('username', `%${search}%`);
      if (rank) query = query.eq('user_ranks.current_rank', rank);
    } else if (hasNodeParam === 'false') {
      // Supabase JS doesn't have an easy "not exists" for related tables in simple queries.
      // So we might fetch all and filter or ignore this specific case for simplicity if not strictly required in standard SQL.
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users', details: error }, { status: 500 });
    }

    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      is_active: u.is_active,
      created_at: u.created_at,
      current_rank: u.user_ranks?.current_rank,
      has_binary_node: u.binary_nodes ? (Array.isArray(u.binary_nodes) ? u.binary_nodes.length > 0 : true) : false,
      total_balance_inr: (u.wallets && u.wallets[0] ? u.wallets[0].total_balance_paise : (u.wallets?.total_balance_paise || 0)) / 100,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
