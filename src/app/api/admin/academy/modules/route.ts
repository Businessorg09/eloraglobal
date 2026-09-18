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

    // Get all modules and their nested episodes, ordered by index
    const { data: modules, error } = await supabase
      .from('academy_modules')
      .select(`
        *,
        episodes:academy_episodes(*)
      `)
      .order('order_index', { ascending: true })
      // Since we can't easily order nested relations in the main query without postgrest syntax,
      // we'll sort episodes in memory below if needed, or use order param:
      // Note: Supabase JS doesn't support nested ordering easily in v2 without raw strings,
      // but we can sort them in JavaScript.

    if (error) throw error;

    // Sort episodes within modules
    modules.forEach(mod => {
      if (mod.episodes) {
        mod.episodes.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
      }
    });

    return NextResponse.json({ modules });
  } catch (error: any) {
    console.error('Academy Modules GET Error:', error);
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

    // Check auth and role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Insert module
    const { data: newModule, error } = await supabase
      .from('academy_modules')
      .insert({
        title: body.title,
        description: body.description || '',
        instructor: body.instructor || '',
        package_tier_required: body.package_tier_required || 1,
        order_index: body.order_index || 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ module: { ...newModule, episodes: [] } });
  } catch (error: any) {
    console.error('Academy Modules POST Error:', error);
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
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          }
        },
      }
    );

    // Auth check...
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    
    const { data: updatedModule, error } = await supabase
      .from('academy_modules')
      .update({
        title: body.title,
        description: body.description,
        instructor: body.instructor,
        package_tier_required: body.package_tier_required,
        order_index: body.order_index
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ module: updatedModule });
  } catch (error: any) {
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
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          }
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single();
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('academy_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
