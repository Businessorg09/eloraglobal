import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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

    // Fetch the single most recently watched episode progress
    const { data: progress, error } = await supabase
      .from('academy_progress')
      .select(`
        progress_seconds,
        is_completed,
        episode:academy_episodes(
          id, title, duration_seconds, video_url, video_type, thumbnail_url, order_index, pdf_url,
          module:academy_modules(id, title, package_tier_required)
        )
      `)
      .eq('user_id', user.id)
      .order('last_watched_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned", which is fine
      throw error;
    }

    return NextResponse.json({ progress: progress || null });
  } catch (error: any) {
    console.error('Progress GET Error:', error);
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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { episode_id, progress_seconds, is_completed } = body;

    const { error } = await supabase
      .from('academy_progress')
      .upsert({
        user_id: user.id,
        episode_id,
        progress_seconds,
        is_completed,
        last_watched_at: new Date().toISOString()
      }, { onConflict: 'user_id, episode_id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Progress POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
