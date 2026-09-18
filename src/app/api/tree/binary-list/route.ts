import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Fetch target user's node
    const { data: node, error: nodeError } = await adminDb
      .from('binary_nodes')
      .select('id, path')
      .eq('user_id', user.id)
      .single()

    if (nodeError || !node) {
      return NextResponse.json({ members: [] })
    }

    // 3. Fetch ALL binary nodes and filter descendants in JS
    //    (PostgREST .like() does NOT work on ltree columns — it silently returns empty)
    const { data: allNodes, error: allNodesError } = await adminDb
      .from('binary_nodes')
      .select('id, user_id, parent_id, position, path, is_active, created_at')

    if (allNodesError || !allNodes) {
      return NextResponse.json({ members: [] })
    }

    // Filter to only descendants of the user's node
    const descendants = allNodes
      .filter(n => n.path.startsWith(node.path + '.'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
    if (descendants.length === 0) {
      return NextResponse.json({ members: [] })
    }

    // 4. Fetch user details for these descendants
    const userIds = descendants.map(d => d.user_id)
    
    const { data: usersData } = await adminDb
      .from('users')
      .select('id, username, full_name, referred_by')
      .in('id', userIds)

    const { data: ranksData } = await adminDb
      .from('user_ranks')
      .select('user_id, current_rank')
      .in('user_id', userIds)

    const userMap = new Map((usersData || []).map(u => [u.id, u]))
    const rankMap = new Map((ranksData || []).map(r => [r.user_id, r]))

    // Find direct left/right child paths to determine leg
    const leftChild = descendants.find(n => n.parent_id === node.id && n.position === 'L')
    const rightChild = descendants.find(n => n.parent_id === node.id && n.position === 'R')

    const members = descendants.map(d => {
      const u = userMap.get(d.user_id)
      const r = rankMap.get(d.user_id)
      
      let leg = 'Auto'
      if (leftChild && (d.path === leftChild.path || d.path.startsWith(leftChild.path + '.'))) {
        leg = 'L'
      } else if (rightChild && (d.path === rightChild.path || d.path.startsWith(rightChild.path + '.'))) {
        leg = 'R'
      }

      return {
        id: d.user_id,
        username: u?.username || 'Unknown',
        full_name: u?.full_name || 'Unknown',
        placement_leg: leg,
        is_direct: u?.referred_by === user.id,
        current_rank: r?.current_rank || 'BRONZE',
        has_active_node: d.is_active,
        joined_at: d.created_at,
        level: d.path.split('.').length - node.path.split('.').length // relative depth
      }
    })

    return NextResponse.json({ members })
  } catch (error: any) {
    console.error('Binary List API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
