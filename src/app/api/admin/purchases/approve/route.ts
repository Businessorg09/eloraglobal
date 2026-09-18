import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolvePlacement, buildChildPath, propagateBv } from '@/lib/engines/binary-tree'

export async function POST(request: Request) {
  try {
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data: adminUser } = await adminDb.from('users').select('role').eq('id', user.id).single()

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Fetch the purchase request
    const { data: purchase, error: purchaseError } = await adminDb
      .from('package_purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase request not found.' }, { status: 404 })
    }

    let meta: any = { status: 'APPROVED' };
    try { if (purchase.payment_gateway_id) meta = JSON.parse(purchase.payment_gateway_id); } catch(e){}

    if (meta.status !== 'PENDING') {
      return NextResponse.json({ error: 'Purchase is not pending.' }, { status: 400 })
    }

    // We will update the database at the very end after successful tree placement


    // --- EXECUTE MLM PLACEMENT LOGIC ---

    if (purchase.purchase_type === 'INITIAL') {
      // 3. Verify user doesn't already have an active binary node
      const { data: existingNode } = await adminDb
        .from('binary_nodes')
        .select('id, is_active, parent_id')
        .eq('user_id', purchase.user_id)
        .maybeSingle()

      if (existingNode && existingNode.is_active) {
        // Do not return early. We still need to update limits and propagate BV.
      }

      // 4. Fetch user's profile to find their sponsor and placement position
      const { data: profile, error: profileError } = await adminDb
        .from('users')
        .select('referred_by, referred_position')
        .eq('id', purchase.user_id)
        .single()

      if (profileError || !profile) {
        throw new Error('User profile not found for binary placement.')
      }

      // 8. Fetch package limit
      const { data: pkg } = await adminDb
        .from('packages')
        .select('binary_income_limit')
        .eq('id', purchase.package_id)
        .single()

      let nodeId = existingNode?.id
      let placementParentId = existingNode?.parent_id

      if (!existingNode) {
        // Fallback: If node doesn't exist, place them now
        let parentId: string | null = null
        let finalPosition: 'L' | 'R' | null = null
        let nodePath = ''

        // 5. If they have a sponsor, resolve placement in binary tree
        if (profile.referred_by) {
          const placement = await resolvePlacement(adminDb, profile.referred_by, profile.referred_position as 'L' | 'R' | undefined)
          parentId = placement.parentId
          finalPosition = placement.position

          // Fetch parent path to build child path
          const { data: parentNode, error: parentNodeError } = await adminDb
            .from('binary_nodes')
            .select('path')
            .eq('id', parentId)
            .single()

          if (parentNodeError || !parentNode) {
            throw new Error('Failed to fetch parent path.')
          }

          nodePath = buildChildPath(parentNode.path, finalPosition, purchase.user_id)
        } else {
          // Root Node (no sponsor)
          nodePath = purchase.user_id.replace(/-/g, '_')
        }

        // 6. Find sponsor's binary node id
        let sponsorNodeId: string | null = null
        if (profile.referred_by) {
          const { data: sponsorNode } = await adminDb
            .from('binary_nodes')
            .select('id')
            .eq('user_id', profile.referred_by)
            .maybeSingle()
          sponsorNodeId = sponsorNode?.id || null
        }

        // 7. Create binary node
        const { data: newNode, error: createNodeError } = await adminDb
          .from('binary_nodes')
          .insert({
            user_id: purchase.user_id,
            sponsor_id: sponsorNodeId,
            parent_id: parentId,
            position: finalPosition,
            path: nodePath,
            is_active: true
          })
          .select()
          .single()

        if (createNodeError || !newNode) {
          throw new Error(`Failed to create binary node: ${createNodeError?.message}`)
        }
        
        nodeId = newNode.id
        placementParentId = parentId

        // 9. Initialize binary node volume record
        await adminDb
          .from('binary_node_volumes')
          .insert({
            node_id: nodeId,
            binary_income_limit_paise: pkg?.binary_income_limit || 0,
            is_binary_earning_active: true
          })

      } else {
        // Activate existing inactive node
        await adminDb.from('binary_nodes').update({ is_active: true }).eq('id', nodeId)
        await adminDb.from('binary_node_volumes').update({
          binary_income_limit_paise: pkg?.binary_income_limit || 0,
          is_binary_earning_active: true
        }).eq('node_id', nodeId)
      }

      // 10. Propagate BV upwards
      if (purchase.bv_generated > 0) {
        await propagateBv(adminDb, nodeId, purchase.bv_generated)
      }

      // 11. Increment sponsor's active direct count
      if (profile.referred_by) {
        const { data: sponsorRank } = await adminDb
          .from('user_ranks')
          .select('active_direct_count')
          .eq('user_id', profile.referred_by)
          .single()

        if (sponsorRank) {
          await adminDb
            .from('user_ranks')
            .update({
              active_direct_count: (sponsorRank.active_direct_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', profile.referred_by)
        }
      }

    } else if (purchase.purchase_type === 'UPGRADE' || purchase.purchase_type === 'REACTIVATION') {
      
      // Fetch the user's binary node to propagate BV
      const { data: binaryNode, error: nodeError } = await adminDb
        .from('binary_nodes')
        .select('id')
        .eq('user_id', purchase.user_id)
        .single()

      if (nodeError || !binaryNode) {
        throw new Error('Binary node not found for user.')
      }

      // Fetch new package limit
      const { data: pkg } = await adminDb
        .from('packages')
        .select('binary_income_limit')
        .eq('id', purchase.package_id)
        .single()

      // Update the 5x limit on node volumes
      await adminDb
        .from('binary_node_volumes')
        .update({
          binary_income_limit_paise: pkg?.binary_income_limit || 0,
          is_binary_earning_active: true, // Reactivate earning if they were capped
        })
        .eq('node_id', binaryNode.id)

      // Propagate the new BV upward
      if (purchase.bv_generated > 0) {
        await propagateBv(adminDb, binaryNode.id, purchase.bv_generated)
      }
    }

    // 12. Finalize status update ONLY after all tree logic succeeds
    meta.status = 'APPROVED';
    meta.approved_by = user.id;
    meta.approved_at = new Date().toISOString();

    const { error: updateError } = await adminDb
      .from('package_purchases')
      .update({
        payment_gateway_id: JSON.stringify(meta)
      })
      .eq('id', purchaseId)

    if (updateError) {
      throw new Error(`Failed to finalize purchase status: ${updateError.message}`)
    }
    
    // --- SEND NOTIFICATION TO USER ---
    import('@/lib/notifications').then(({ createNotification }) => {
      createNotification(
        purchase.user_id,
        'Package Activated',
        `Your ${purchase.purchase_type.toLowerCase()} package purchase was approved and activated successfully.`,
        'SYSTEM'
      ).catch(console.error);
    });

    return NextResponse.json({ message: `Purchase approved (${purchase.purchase_type}) successfully.` })
  } catch (error: any) {
    console.error('Approve Purchase API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
