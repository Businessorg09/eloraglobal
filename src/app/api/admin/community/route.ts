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

    // Verify Admin Status
    const { data: adminCheck } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminCheck?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { action, targetId, value } = await request.json();

    
    if (action === 'EDIT_POST') {
      const { error } = await supabase.from('community_posts').update({ content: value }).eq('id', targetId);
      if (error) throw error;
      
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action_type: 'EDIT_POST',
        target_id: targetId
      });
      return NextResponse.json({ success: true, message: 'Post edited successfully' });
    }

    if (action === 'DELETE_POST') {
      const { error } = await supabase.from('community_posts').delete().eq('id', targetId);
      if (error) throw error;
      
      // Log audit
      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action_type: 'DELETE_POST',
        target_id: targetId
      });
      return NextResponse.json({ success: true, message: 'Post deleted' });
    }

    if (action === 'SHADOWBAN_USER') {
      const { error } = await supabase
        .from('users')
        .update({ is_shadowbanned: value }) // true or false
        .eq('id', targetId);
        
      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action_type: value ? 'SHADOWBAN_USER' : 'UNSHADOWBAN_USER',
        target_id: targetId
      });
      return NextResponse.json({ success: true, message: `User shadowban set to ${value}` });
    }

    if (action === 'SET_VERIFIED') {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: value }) // true or false
        .eq('id', targetId);
        
      if (error) throw error;
      return NextResponse.json({ success: true, message: `User verified set to ${value}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Admin Community POST Error:', error);
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

    // Fetch latest 50 posts for moderation
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        id,
        content,
        created_at,
        users:user_id (id, full_name, username, is_verified, is_shadowbanned)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    // Also fetch users for moderation
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, username, is_verified, is_shadowbanned, role')
      .order('created_at', { ascending: false })
      .limit(50);

    if (userError) throw userError;

    return NextResponse.json({ posts, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
