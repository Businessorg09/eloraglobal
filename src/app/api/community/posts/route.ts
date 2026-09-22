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

    // Fetch posts with author details using explicit foreign key column to avoid relationship ambiguity
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:users!community_posts_author_id_fkey(id, full_name, username, custom_title, is_verified, is_shadowbanned),
        comments:community_comments(id),
        likes:community_likes(user_id)
      `)
      .lte('created_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Filter out shadowbanned users' posts unless the current user is the author
    const filteredPosts = posts.filter(post => 
      !post.author.is_shadowbanned || post.author.id === user.id
    );

    return NextResponse.json({ posts: filteredPosts, currentUserId: user.id });
  } catch (error: any) {
    console.error('Community GET Error:', error);
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

    const { content, imageUrl, category } = await request.json();

    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Content or image is required' }, { status: 400 });
    }

    // --- GOD-MODE INTERCEPTOR ---
    const [{ data: settings }, { data: currentUser }, { data: blacklist }] = await Promise.all([
      supabase.from('community_settings').select('global_chat_locked, media_uploads_allowed').eq('id', 1).single(),
      supabase.from('users').select('muted_until, account_status').eq('id', user.id).single(),
      supabase.from('admin_blacklisted_words').select('word')
    ]);

    if (settings?.global_chat_locked) return NextResponse.json({ error: 'Community is currently in Lockdown.' }, { status: 403 });
    if (currentUser?.account_status === 'FROZEN') return NextResponse.json({ error: 'Account frozen.' }, { status: 403 });
    if (currentUser?.muted_until && new Date(currentUser.muted_until) > new Date()) return NextResponse.json({ error: 'You are currently muted.' }, { status: 403 });
    if (imageUrl && settings && !settings.media_uploads_allowed) return NextResponse.json({ error: 'Media uploads are disabled globally.' }, { status: 403 });

    if (content && blacklist && blacklist.length > 0) {
      const lowerContent = content.toLowerCase();
      for (const rule of blacklist) {
        if (lowerContent.includes(rule.word.toLowerCase())) {
          // Auto-mute for 24h as penalty
          const muted_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('users').update({ muted_until }).eq('id', user.id);
          return NextResponse.json({ error: 'Message blocked by Auto-Mod. You have been muted for 24h.' }, { status: 403 });
        }
      }
    }
    // --- END INTERCEPTOR ---


    const { data: newPost, error } = await supabase
      .from('community_posts')
      .insert({
        author_id: user.id,
        content: content || '',
        image_url: imageUrl || null,
        category: category || 'General',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: any) {
    console.error('Community POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this post' }, { status: 403 });
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Community DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
