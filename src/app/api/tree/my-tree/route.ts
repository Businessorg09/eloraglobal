import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate the logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Determine which user's tree to fetch
    //    If no targetUserId given, use the logged-in user's own tree
    const searchId = targetUserId || user.id

    // 3. Get the root node of the tree we want to display
    const { data: startNode, error: nodeError } = await adminDb
      .from('binary_nodes')
      .select('id, path')
      .eq('user_id', searchId)
      .single()

    if (nodeError || !startNode) {
      return NextResponse.json({ rootId: null, nodes: [] })
    }

    // 4. Security check: if requesting a different user's tree,
    //    ensure that the logged-in user is an ancestor (above them in the tree)
    //    OR that the logged-in user IS the target user
    if (targetUserId && targetUserId !== user.id) {
      const { data: myNode } = await adminDb
        .from('binary_nodes')
        .select('path')
        .eq('user_id', user.id)
        .single()

      // Check the logged-in user is above or equal in the tree
      // myNode.path must be a proper prefix of startNode.path with a dot separator
      const myPath = myNode?.path || ''
      const isAncestor = startNode.path === myPath || startNode.path.startsWith(myPath + '.')
      
      if (!myNode || !isAncestor) {
        // Still allow if user is admin
        const { data: userProfile } = await adminDb.from('users').select('role').eq('id', user.id).single()
        if (!userProfile || userProfile.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Access denied to this sub-tree.' }, { status: 403 })
        }
      }
    }

    // 5. Fetch ALL nodes and filter descendants in-memory (PostgREST ltree workaround)
    const { data: allNodes, error: treeError } = await adminDb
      .from('binary_nodes')
      .select(`
        id, user_id, parent_id, position, path, is_active,
        users (username, full_name),
        binary_node_volumes (left_bv, right_bv, left_bv_carryover, right_bv_carryover)
      `)

    if (treeError) {
      console.error('Tree fetch error:', treeError)
      return NextResponse.json({ rootId: startNode.id, nodes: [] })
    }

    // Filter to only descendants (nodes whose path starts with startNode.path)
    const rawDescendants = (allNodes || []).filter(
      (n: any) => n.path === startNode.path || n.path.startsWith(startNode.path + '.')
    )

    if (!rawDescendants || rawDescendants.length === 0) {
      return NextResponse.json({ rootId: startNode.id, nodes: [] })
    }

    // 6. Format nodes for frontend — ALL nodes (active and inactive)
    const formattedNodes = rawDescendants.map((node: any) => ({
      id: node.id,
      userId: node.user_id,
      parentId: node.parent_id,
      position: node.position,
      path: node.path,
      isActive: node.is_active,
      fullName: node.users?.full_name || 'Unknown',
      username: node.users?.username || 'unknown',
      rank: 'BRONZE',
      volumes: {
        leftTotal: (node.binary_node_volumes?.left_bv || 0) + (node.binary_node_volumes?.left_bv_carryover || 0),
        rightTotal: (node.binary_node_volumes?.right_bv || 0) + (node.binary_node_volumes?.right_bv_carryover || 0),
      },
    }))

    return NextResponse.json({
      rootId: startNode.id,
      nodes: formattedNodes,
    })
  } catch (error: any) {
    console.error('Fetch Tree API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
