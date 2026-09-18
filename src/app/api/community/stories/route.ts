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
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active stories (expires_at > now) from users that the current user follows, or from themselves
    const { data: following } = await supabase.from('user_follows').select('following_id').eq('follower_id', user.id);
    const followingIds = following ? following.map(f => f.following_id) : [];
    
    // Always include the user's own stories
    followingIds.push(user.id);

    const { data: stories, error } = await supabase
      .from('user_stories')
      .select(`
        *,
        author:users!user_stories_author_id_fkey(id, username, full_name, custom_title, is_verified)
      `)
      .in('author_id', followingIds)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ stories });
  } catch (error: any) {
    console.error('Stories GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, content } = await request.json();

    if (!imageUrl && !content) {
      return NextResponse.json({ error: 'Image or content is required' }, { status: 400 });
    }

    // Story expires 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error } = await supabase
      .from('user_stories')
      .insert({
        author_id: user.id,
        image_url: imageUrl,
        content: content || null,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Stories POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
