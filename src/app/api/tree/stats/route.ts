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
      return NextResponse.json({
        memberCount: { left: 0, right: 0, total: 0 },
        volumes: null
      })
    }

    // 3. Fetch ALL nodes and filter in JS (PostgREST .like() does NOT work on ltree columns)
    const { data: allNodes, error: allNodesError } = await adminDb
      .from('binary_nodes')
      .select('id, parent_id, position, path, is_active')

    let leftCount = 0
    let rightCount = 0

    if (!allNodesError && allNodes) {
      // Find direct left/right children by parent_id
      const leftChild = allNodes.find(n => n.parent_id === node.id && n.position === 'L')
      const rightChild = allNodes.find(n => n.parent_id === node.id && n.position === 'R')

      // Count all descendants under each leg using JS string prefix match on path
      if (leftChild) {
        leftCount = allNodes.filter(n =>
          n.path === leftChild.path || n.path.startsWith(leftChild.path + '.')
        ).length
      }

      if (rightChild) {
        rightCount = allNodes.filter(n =>
          n.path === rightChild.path || n.path.startsWith(rightChild.path + '.')
        ).length
      }
    }

    // 4. Fetch volume records
    const { data: volumes, error: volError } = await adminDb
      .from('binary_node_volumes')
      .select('*')
      .eq('node_id', node.id)
      .single()

    if (volError) {
      console.error('Error loading volumes:', volError)
    }

    
    // 4.5 Fetch personal BV
    const { data: purchases } = await adminDb
      .from('package_purchases')
      .select('bv_generated')
      .eq('user_id', user.id)
    
    const personalBv = purchases ? purchases.reduce((sum, p) => sum + (p.bv_generated || 0), 0) : 0;

    return NextResponse.json({
      memberCount: {
        left: leftCount,
        right: rightCount,
        total: leftCount + rightCount,
      },
      volumes: volumes ? {
        leftBv: volumes.left_bv || 0,
        rightBv: volumes.right_bv || 0,
        leftBvCarryover: volumes.left_bv_carryover || 0,
        rightBvCarryover: volumes.right_bv_carryover || 0,
        leftLifetimeRankBv: Number(volumes.left_lifetime_rank_bv || 0),
        rightLifetimeRankBv: Number(volumes.right_lifetime_rank_bv || 0),
        personalBv: personalBv,
        totalMatchedBv: Number(volumes.total_binary_income_earned_paise || 0) / 80000 * 100,
      } : {
        leftBv: 0,
        rightBv: 0,
        leftBvCarryover: 0,
        rightBvCarryover: 0,
        leftLifetimeRankBv: 0,
        rightLifetimeRankBv: 0,
        personalBv: 0,
        totalMatchedBv: 0,
      }
    })
  } catch (error: any) {
    console.error('Tree Stats API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
