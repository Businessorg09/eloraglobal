import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data, error } = await adminDb
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ notifications: data || [] })
  } catch (error: any) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { notificationIds } = body

    const adminDb = createAdminClient()
    
    // If notificationIds provided, mark them read. Otherwise, mark all as read.
    let query = adminDb.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    
    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      query = query.in('id', notificationIds)
    }

    const { error } = await query

    if (error) {
      console.error('Error marking notifications read:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
