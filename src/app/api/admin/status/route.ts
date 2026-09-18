import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminDb = createAdminClient()
    
    // Fetch all users
    const { data: users, error: usersErr } = await adminDb
      .from('users')
      .select('id, username, email, referred_by')
      
    // Fetch all binary nodes
    const { data: nodes, error: nodesErr } = await adminDb
      .from('binary_nodes')
      .select('id, user_id, path, is_active')
      
    return NextResponse.json({ users, nodes })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
