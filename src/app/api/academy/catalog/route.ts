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

    // Determine the user's purchased package tier
    // In our system, the highest package purchased determines access level.
    const { data: purchases } = await supabase
      .from('package_purchases')
      .select('package:packages!package_id(slug)')
      .eq('user_id', user.id);
      
    let userTier = 0; // Default to 0 (No package/Trading Account)
    
    if (purchases && purchases.length > 0) {
      const slugs = purchases.map((p: any) => p.package?.slug?.toLowerCase());
      if (slugs.includes('elite')) userTier = 3;
      else if (slugs.includes('pro')) userTier = 2;
      else userTier = 1; // Starter
    }

    // Get all modules and episodes
    const { data: modules, error } = await supabase
      .from('academy_modules')
      .select(`
        *,
        episodes:academy_episodes(id, title, description, duration_seconds, order_index, pdf_url, video_url)
      `)
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Secure the data: If the user doesn't have the required tier, strip the video_url!
    modules.forEach(mod => {
      const isLocked = mod.package_tier_required > userTier;
      mod.isLocked = isLocked;
      
      if (mod.episodes) {
        mod.episodes.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
        
        mod.episodes.forEach((ep: any) => {
          if (isLocked) {
            ep.video_url = null; // Strip the video URL if locked for security!
            ep.pdf_url = null;
          }
        });
      }
    });

    return NextResponse.json({ modules, userTier });
  } catch (error: any) {
    console.error('Academy Catalog GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
