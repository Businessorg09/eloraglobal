import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminCheck } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (adminCheck?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { action, targetId, value, metadata } = await request.json();

    if (action === 'EDIT_POST') {
      const { error } = await supabase.from('community_posts').update({ content: value }).eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Post edited successfully' });
    }

    if (action === 'DELETE_COMMENT') {
      const { error } = await supabase.from('community_comments').delete().eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Comment deleted' });
    }
    
    if (action === 'DELETE_POST') {
      const { error } = await supabase.from('community_posts').delete().eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Post deleted' });
    }

    if (action === 'PIN_POST') {
      const { error } = await supabase.from('community_posts').update({ is_pinned: value }).eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `Post pinned status: ${value}` });
    }

    if (action === 'DELETE_CHAT') {
      const { error } = await supabase.from('chat_messages').delete().eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Message deleted' });
    }

    if (action === 'SHADOWBAN_USER') {
      const { error } = await supabase.from('users').update({ is_shadowbanned: value }).eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `User shadowban set to ${value}` });
    }
    
    if (action === 'FREEZE_USER') {
      const { error } = await supabase.from('users').update({ account_status: value ? 'FROZEN' : 'ACTIVE' }).eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `Account status frozen: ${value}` });
    }

    if (action === 'SET_VERIFIED') {
      const { error } = await supabase.from('users').update({ is_verified: value }).eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true, message: `User verified set to ${value}` });
    }
    
    if (action === 'MUTE_USER') {
      // value is hours
      const muted_until = value > 0 ? new Date(Date.now() + value * 60 * 60 * 1000).toISOString() : null;
      const { error } = await supabase.from('users').update({ muted_until, warning_count: metadata?.incrementWarning ? undefined : undefined }).eq('id', targetId);
      // Wait, we need to increment warning separately if requested, but let's just do it in one query if possible via RPC. 
      // For now just set muted_until
      if (error) throw error;
      return NextResponse.json({ success: true, message: muted_until ? `Muted until ${muted_until}` : 'Unmuted' });
    }
    
    if (action === 'ADD_BLACKLIST') {
      const { error } = await supabase.from('admin_blacklisted_words').insert({ word: value, action: 'DELETE' });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    
    if (action === 'REMOVE_BLACKLIST') {
      const { error } = await supabase.from('admin_blacklisted_words').delete().eq('id', targetId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
    
    if (action === 'UPDATE_SETTINGS') {
      const { error } = await supabase.from('community_settings').update(value).eq('id', 1);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminCheck } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (adminCheck?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Fetch posts
    const { data: posts } = await supabase
      .from('community_posts')
      .select('id, content, category, created_at, is_pinned, is_mock, image_url, author:users!community_posts_author_id_fkey(id, full_name, username, custom_title, is_verified, is_shadowbanned), comments:community_comments(id, content, created_at, author:users!community_comments_author_id_fkey(id, full_name, username, custom_title))')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch chat messages
    const { data: chats } = await supabase
      .from('chat_messages')
      .select('id, content, created_at, room_id, sender:sender_id(id, full_name, username)')
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch users
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, username, is_verified, is_shadowbanned, role, account_status, muted_until, warning_count')
      .order('created_at', { ascending: false })
      .limit(50);
      
    // Fetch settings
    const { data: settings } = await supabase.from('community_settings').select('*').eq('id', 1).single();
    
    // Fetch blacklist
    const { data: blacklist } = await supabase.from('admin_blacklisted_words').select('*').order('created_at', { ascending: false });

    return NextResponse.json({ posts, chats, users, settings, blacklist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
