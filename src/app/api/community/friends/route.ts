import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET: Search users by username (Find Friends)
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          }
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      // Return default suggested users
      const { data: suggestedUsers, error } = await supabase
        .from('users')
        .select('id, username, full_name, custom_title, is_verified')
        .neq('id', user.id)
        .limit(5);

      if (error) throw error;

      // Get following status for these suggested users
      const { data: following, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', suggestedUsers.map(u => u.id));

      if (followingError) throw followingError;

      const followingIds = new Set(following.map(f => f.following_id));
      const enrichedUsers = suggestedUsers.map(u => ({
        ...u,
        is_following: followingIds.has(u.id)
      }));

      return NextResponse.json({ users: enrichedUsers });
    }

    // Search users by username or full name
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, full_name, custom_title, is_verified')
      .neq('id', user.id)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    // Get following status for these users
    const { data: following, error: followingError } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', users.map(u => u.id));

    if (followingError) throw followingError;

    const followingIds = new Set(following.map(f => f.following_id));

    const enrichedUsers = users.map(u => ({
      ...u,
      is_following: followingIds.has(u.id)
    }));

    return NextResponse.json({ users: enrichedUsers });
  } catch (error: any) {
    console.error('Friends GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Toggle follow status
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          }
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, action } = await request.json(); // action = 'follow' | 'unfollow'

    if (action === 'follow') {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: targetUserId });
      if (error) throw error;
    } else if (action === 'unfollow') {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .match({ follower_id: user.id, following_id: targetUserId });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Friends POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
