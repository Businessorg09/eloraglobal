import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { RANKS, RANK_ORDER, RankKey } from '@/lib/constants/ranks'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Fetch user's rank details
    const { data: rankRecord, error: rankError } = await adminDb
      .from('user_ranks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (rankError || !rankRecord) {
      return NextResponse.json({ error: 'Rank details not found.' }, { status: 404 })
    }

    // 3. Fetch user's lifetime volumes from binary_nodes & volumes
    const { data: binaryNode, error: nodeError } = await adminDb
      .from('binary_nodes')
      .select('id, binary_node_volumes(left_lifetime_rank_bv, right_lifetime_rank_bv)')
      .eq('user_id', user.id)
      .single()

    const volumes = (binaryNode as any)?.binary_node_volumes
    const leftLifetime = Number(volumes?.left_lifetime_rank_bv || 0)
    const rightLifetime = Number(volumes?.right_lifetime_rank_bv || 0)
    const currentBv = Math.min(leftLifetime, rightLifetime)

    // 4. Resolve true current rank based on actual BV and Directs
    let currentRankKey: RankKey = 'STARTER'
    let currentRankIndex = 0

    // Find the highest rank the user actually qualifies for
    const activeDirects = rankRecord.active_direct_count || 0
    for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
      const rankDef = RANKS[RANK_ORDER[i]]
      if (currentBv >= rankDef.requiredBv && activeDirects >= rankDef.requiredDirects) {
        currentRankKey = RANK_ORDER[i]
        currentRankIndex = i
        break
      }
    }
    
    let nextRankKey: RankKey | null = null
    let nextRankDef = null
    let progressBvPercent = 100
    let progressDirectsPercent = 100

    if (currentRankIndex < RANK_ORDER.length - 1) {
      nextRankKey = RANK_ORDER[currentRankIndex + 1]
      nextRankDef = RANKS[nextRankKey]
      
      const currentRankDef = RANKS[currentRankKey]
      const bvRequiredForNext = nextRankDef.requiredBv
      const directsRequiredForNext = nextRankDef.requiredDirects

      // Calculate relative BV progress
      const bvStart = currentRankDef.requiredBv
      const bvNeeded = bvRequiredForNext - bvStart
      const bvAccumulated = Math.max(0, currentBv - bvStart)
      progressBvPercent = bvNeeded > 0 ? Math.min(100, Math.floor((bvAccumulated / bvNeeded) * 100)) : 100

      // Calculate relative Directs progress
      const directsStart = currentRankDef.requiredDirects
      const directsNeeded = directsRequiredForNext - directsStart
      const directsAccumulated = Math.max(0, activeDirects - directsStart)
      progressDirectsPercent = directsNeeded > 0 ? Math.min(100, Math.floor((directsAccumulated / directsNeeded) * 100)) : 100
    }

    return NextResponse.json({
      currentRank: currentRankKey,
      displayName: RANKS[currentRankKey].name,
      weeklyCap: RANKS[currentRankKey].weeklyBinaryCapInr,
      lifetimeVolumes: {
        left: leftLifetime,
        right: rightLifetime,
        balancing: currentBv,
      },
      activeDirects: rankRecord.active_direct_count || 0,
      nextRank: nextRankKey && nextRankDef ? {
        rank: nextRankKey,
        displayName: nextRankDef.name,
        requirements: {
          bv: nextRankDef.requiredBv,
          directs: nextRankDef.requiredDirects,
          weeklyCap: nextRankDef.weeklyBinaryCapInr,
          achievementBonus: nextRankDef.achievementBonusInr,
        },
        progress: {
          bvPercent: progressBvPercent,
          directsPercent: progressDirectsPercent,
        },
      } : null,
    })
  } catch (error: any) {
    console.error('Rank Status API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
