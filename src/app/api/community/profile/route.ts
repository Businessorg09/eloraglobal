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

    let { data: profile, error } = await supabase
      .from('users')
      .select('id, full_name, username, custom_title, is_verified, role, bio')
      .eq('id', user.id)
      .single();

    if (error && error.message.includes('bio')) {
      const fallback = await supabase
        .from('users')
        .select('id, full_name, username, custom_title, is_verified, role')
        .eq('id', user.id)
        .single();
      profile = fallback.data as any;
      error = fallback.error;
    }

    if (error) throw error;

    // Fetch user's posts
    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('id, image_url, content, likes_count, comments_count, author_id, created_at, likes:community_likes(user_id), comments:community_comments(id, content, created_at, author:users!community_comments_author_id_fkey(id, full_name, username, custom_title))')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
      
    if (postsError) throw postsError;

    return NextResponse.json({ profile, posts });
  } catch (error: any) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const updates = await request.json();

    let { data: profile, error } = await supabase
      .from('users')
      .update({
        full_name: updates.fullName,
        username: updates.username,
        bio: updates.bio,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error && error.message.includes('bio')) {
      const fallback = await supabase
        .from('users')
        .update({
          full_name: updates.fullName,
          username: updates.username,
        })
        .eq('id', user.id)
        .select()
        .single();
      profile = fallback.data as any;
      error = fallback.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
