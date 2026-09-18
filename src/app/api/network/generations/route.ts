import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create the admin client to bypass the infinite recursion RLS policy issue on binary_nodes.
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get the current user's binary node (using admin to avoid RLS crash)
    const { data: userNode, error: nodeError } = await supabaseAdmin
      .from('binary_nodes')
      .select('id, path, depth')
      .eq('user_id', user.id)
      .single()

    if (nodeError || !userNode) {
      // User hasn't been placed in the binary tree yet, so they have no downline.
      console.error("userNode fetch failed:", nodeError);
      return NextResponse.json({
        success: true,
        root: null,
        generations: []
      })
    }

    // 2. Fetch all nodes and filter in-memory (PostgREST ltree workaround)
    const { data: allNodes, error: descError } = await supabaseAdmin
      .from('binary_nodes')
      .select(`
        id,
        user_id,
        position,
        depth,
        path,
        is_active,
        users!binary_nodes_user_id_fkey (
          full_name,
          username,
          email,
          referral_code,
          created_at,
          user_ranks (
            current_rank,
            active_direct_count
          )
        ),
        binary_node_volumes (
          left_bv,
          right_bv,
          left_bv_carryover,
          right_bv_carryover
        )
      `)

    if (descError) {
      console.error('Error fetching descendants:', descError)
      return NextResponse.json({ error: descError.message }, { status: 500 })
    }

    // Process nodes
    const rootNodeRaw = (allNodes || []).find((n: any) => n.path === userNode.path)
    const descendants = (allNodes || []).filter(
      (n: any) => n.path !== userNode.path && n.path.startsWith(userNode.path + '.')
    )

    // 3. Process and group by relative depth (Level 1, Level 2, etc.)
    const levels: Record<number, any[]> = {}

    descendants?.forEach(node => {
      const relDepth = node.depth - userNode.depth
      if (relDepth > 0) {
        if (!levels[relDepth]) levels[relDepth] = []
        
        // Format the data
        const userData = Array.isArray(node.users) ? node.users[0] : node.users
        const rankData = userData?.user_ranks ? (Array.isArray(userData.user_ranks) ? userData.user_ranks[0] : userData.user_ranks) : null
        const volData = Array.isArray(node.binary_node_volumes) ? node.binary_node_volumes[0] : node.binary_node_volumes

        levels[relDepth].push({
          id: node.id,
          user_id: node.user_id,
          position: node.position === 'L' ? 'Left' : 'Right',
          level: relDepth,
          isActive: node.is_active || false,
          fullName: userData?.full_name || 'Unknown',
          username: userData?.username || 'unknown',
          email: userData?.email || '',
          referralCode: userData?.referral_code || '',
          joinDate: userData?.created_at || '',
          rank: rankData?.current_rank || 'BRONZE',
          directsCount: rankData?.active_direct_count || 0,
          leftBv: (volData?.left_bv || 0) + (volData?.left_bv_carryover || 0),
          rightBv: (volData?.right_bv || 0) + (volData?.right_bv_carryover || 0)
        })
      }
    })

    // Format Root Node Data
    let rootFormatted = null
    if (rootNodeRaw) {
      const rootUser = Array.isArray(rootNodeRaw.users) ? rootNodeRaw.users[0] : rootNodeRaw.users
      const rootRank = rootUser?.user_ranks ? (Array.isArray(rootUser.user_ranks) ? rootUser.user_ranks[0] : rootUser.user_ranks) : null
      const rootVol = Array.isArray(rootNodeRaw.binary_node_volumes) ? rootNodeRaw.binary_node_volumes[0] : rootNodeRaw.binary_node_volumes

      rootFormatted = {
        id: rootNodeRaw.id,
        user_id: rootNodeRaw.user_id,
        depth: rootNodeRaw.depth,
        isActive: rootNodeRaw.is_active || false,
        fullName: rootUser?.full_name || 'Unknown',
        username: rootUser?.username || 'unknown',
        email: rootUser?.email || '',
        referralCode: rootUser?.referral_code || '',
        rank: rootRank?.current_rank || 'BRONZE',
        leftBv: (rootVol?.left_bv || 0) + (rootVol?.left_bv_carryover || 0),
        rightBv: (rootVol?.right_bv || 0) + (rootVol?.right_bv_carryover || 0)
      }
    }

    // Convert to array of levels
    const result = Object.keys(levels).map(lvl => ({
      level: parseInt(lvl),
      members: levels[parseInt(lvl)]
    })).sort((a, b) => a.level - b.level)

    return NextResponse.json({
      success: true,
      root: rootFormatted,
      generations: result
    })

  } catch (error: any) {
    console.error('Generations API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
