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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Execute DB Queries in Parallel to dramatically improve load times
    const [
      { data: profile },
      { data: purchases },
      { data: allModules },
      { data: userProgress }
    ] = await Promise.all([
      supabase.from('users').select('full_name').eq('id', user.id).single(),
      supabase.from('package_purchases').select('package:packages!package_id(id, name, funded_account_size, display_order)').eq('user_id', user.id),
      supabase.from('academy_modules').select(`id, title, description, instructor, package_tier_required, order_index, episodes:academy_episodes(id, title, description, video_url, duration_seconds, pdf_url, order_index)`).order('order_index', { ascending: true }),
      supabase.from('academy_progress').select('*').eq('user_id', user.id)
    ]);

    // 2. Process Package Purchases
    let highestTier = 1; // Default
    let packageName = 'None';
    let propAllocation = '$0';

    if (purchases && purchases.length > 0) {
      let maxOrder = 0;
      let activePackage = null;
      for (const p of purchases) {
        const pkg: any = Array.isArray(p.package) ? p.package[0] : p.package;
        if (pkg && pkg.display_order > maxOrder) {
          maxOrder = pkg.display_order;
          activePackage = pkg;
        }
      }
      
      if (activePackage) {
        highestTier = activePackage.display_order;
        packageName = activePackage.name;
        if (activePackage.funded_account_size === 'SIZE_10K') propAllocation = '$10,000';
        else if (activePackage.funded_account_size === 'SIZE_25K') propAllocation = '$25,000';
        else if (activePackage.funded_account_size === 'SIZE_100K') propAllocation = '$100,000';
      }
    }

    // Calculate completion metrics
    let totalEpisodes = 0;
    let completedEpisodes = 0;
    
    // Process playlist
    const playlist = (allModules || []).map(mod => {
      const isLocked = highestTier < mod.package_tier_required;
      
      if (!isLocked) {
        totalEpisodes += mod.episodes.length;
      }

      // Map progress to episodes
      const episodesWithProgress = (mod.episodes || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(ep => {
          const progress = userProgress?.find(p => p.episode_id === ep.id);
          
          if (!isLocked && progress?.is_completed) {
            completedEpisodes++;
          }
          
          return {
            ...ep,
            progress_seconds: progress?.progress_seconds || 0,
            is_completed: progress?.is_completed || false,
            last_watched_at: progress?.last_watched_at || null
          };
        });

      return {
        ...mod,
        isLocked,
        episodes: episodesWithProgress
      };
    });

    const completionPercentage = totalEpisodes > 0 ? Math.floor((completedEpisodes / totalEpisodes) * 100) : 0;
    const modulesCleared = playlist.filter(m => !m.isLocked && m.episodes.length > 0 && m.episodes.every(ep => ep.is_completed)).length;
    const totalUnlockedModules = playlist.filter(m => !m.isLocked).length;

    // 4. Return everything
    return NextResponse.json({
      profile: {
        fullName: profile?.full_name || 'Trader',
        packageName,
        tier: highestTier,
        propAllocation,
        completionPercentage,
        modulesCleared,
        totalUnlockedModules,
        streak: 1 // Hardcoded streak for now as there's no DB logic for daily logins
      },
      playlist
    });

  } catch (error: any) {
    console.error('Dashboard Overview Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
