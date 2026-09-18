import { SupabaseClient } from '@supabase/supabase-js'

export interface BinaryNode {
  id: string
  user_id: string
  sponsor_id: string | null
  parent_id: string | null
  position: 'L' | 'R' | null
  path: string
  depth: number
}

/**
 * Traverses down the extreme leg of a node to find the next open slot.
 * For position 'L', it continuously follows the left child.
 * For position 'R', it continuously follows the right child.
 */
export async function findNextOpenSlot(
  supabase: SupabaseClient,
  startNodeId: string,
  position: 'L' | 'R'
): Promise<{ parentId: string; position: 'L' | 'R' }> {
  let currentId = startNodeId

  while (true) {
    const { data: child, error } = await supabase
      .from('binary_nodes')
      .select('id')
      .eq('parent_id', currentId)
      .eq('position', position)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to find child node: ${error.message}`)
    }

    if (!child) {
      // Found an open slot under currentId at the specified position
      return { parentId: currentId, position }
    }

    currentId = child.id
  }
}

/**
 * Resolves placement parent and position for a new signup.
 * Supports manual positioning (L/R) and auto-positioning (weaker side).
 */
export async function resolvePlacement(
  supabase: SupabaseClient,
  sponsorUserId: string,
  preferredPosition?: 'L' | 'R'
): Promise<{ parentId: string; position: 'L' | 'R' }> {
  // 1. Get the sponsor's binary node
  const { data: sponsorNode, error: sponsorError } = await supabase
    .from('binary_nodes')
    .select('id, user_id')
    .eq('user_id', sponsorUserId)
    .single()

  if (sponsorError || !sponsorNode) {
    throw new Error(`Sponsor node not found in binary tree: ${sponsorError?.message || 'Not found'}`)
  }

  // 2. If position is specified, find the extreme slot on that side
  if (preferredPosition === 'L' || preferredPosition === 'R') {
    return findNextOpenSlot(supabase, sponsorNode.id, preferredPosition)
  }

  // 3. Otherwise, use Auto-Placement (Weaker Side)
  // Fetch the sponsor's current volumes
  const { data: volumes, error: volError } = await supabase
    .from('binary_node_volumes')
    .select('left_bv, right_bv, left_bv_carryover, right_bv_carryover')
    .eq('node_id', sponsorNode.id)
    .single()

  if (volError || !volumes) {
    // If no volume record yet, default to Left
    return findNextOpenSlot(supabase, sponsorNode.id, 'L')
  }

  const totalLeft = volumes.left_bv + volumes.left_bv_carryover
  const totalRight = volumes.right_bv + volumes.right_bv_carryover

  // Go to the weaker side
  const targetPosition: 'L' | 'R' = totalLeft < totalRight ? 'L' : 'R'
  return findNextOpenSlot(supabase, sponsorNode.id, targetPosition)
}

/**
 * Returns the path representation for a new child node based on parent's path.
 * Format: parent_path.sanitized_user_id
 * NOTE: Position (L/R) is stored in the separate `position` column, NOT in the path.
 */
export function buildChildPath(parentPath: string, position: 'L' | 'R', userId: string): string {
  // Sanitize the user_id (replace dashes with underscores for ltree compatibility)
  const sanitizedUserId = userId.replace(/-/g, '_')
  // Path is simply parent.child — position is stored separately
  return `${parentPath}.${sanitizedUserId}`
}

/**
 * Propagates Business Volume (BV) upward to all binary tree ancestors.
 */
export async function propagateBv(
  supabase: SupabaseClient,
  nodeId: string,
  bvAmount: number
): Promise<void> {
  // 1. Get the starting node's parent and position
  const { data: node, error: nodeError } = await supabase
    .from('binary_nodes')
    .select('parent_id, position')
    .eq('id', nodeId)
    .single()

  if (nodeError || !node) {
    throw new Error(`Starting node not found: ${nodeError?.message}`)
  }

  let currentParentId = node.parent_id
  let currentPosition = node.position

  // 2. Loop upward until we reach the root (where parent_id is null)
  while (currentParentId && currentPosition) {
    // Fetch the parent node's volume entry, creating it if it doesn't exist
    const { data: volRecord, error: volFetchError } = await supabase
      .from('binary_node_volumes')
      .select('node_id')
      .eq('node_id', currentParentId)
      .maybeSingle()

    if (volFetchError) {
      console.error(`Error checking volume record for node ${currentParentId}:`, volFetchError)
      break
    }

    if (!volRecord) {
      // Create empty volume record for parent
      const { error: insertError } = await supabase
        .from('binary_node_volumes')
        .insert({ node_id: currentParentId })
      
      if (insertError) {
        console.error(`Error initializing volume record for node ${currentParentId}:`, insertError)
        break
      }
    }

    // 3. Update the volume based on the leg position we entered from
    const incrementObj = currentPosition === 'L' 
      ? { 
          left_bv: (await getVolVal(supabase, currentParentId, 'left_bv')) + bvAmount,
          left_lifetime_rank_bv: (await getVolVal(supabase, currentParentId, 'left_lifetime_rank_bv')) + bvAmount
        }
      : { 
          right_bv: (await getVolVal(supabase, currentParentId, 'right_bv')) + bvAmount,
          right_lifetime_rank_bv: (await getVolVal(supabase, currentParentId, 'right_lifetime_rank_bv')) + bvAmount
        }

    const { error: updateError } = await supabase
      .from('binary_node_volumes')
      .update(incrementObj)
      .eq('node_id', currentParentId)

    if (updateError) {
      console.error(`Error propagating BV to parent ${currentParentId}:`, updateError)
      break
    }

    // 4. Move up to the next level
    const { data: parentNode, error: parentError } = await supabase
      .from('binary_nodes')
      .select('parent_id, position')
      .eq('id', currentParentId)
      .single()

    if (parentError || !parentNode) {
      break
    }

    currentParentId = parentNode.parent_id
    currentPosition = parentNode.position
  }
}

async function getVolVal(
  supabase: SupabaseClient,
  nodeId: string,
  field: 'left_bv' | 'right_bv' | 'left_lifetime_rank_bv' | 'right_lifetime_rank_bv'
): Promise<number> {
  const { data, error } = await supabase
    .from('binary_node_volumes')
    .select('left_bv, right_bv, left_lifetime_rank_bv, right_lifetime_rank_bv')
    .eq('node_id', nodeId)
    .single()
  
  if (error || !data) return 0
  return Number((data as any)[field] || 0)
}

