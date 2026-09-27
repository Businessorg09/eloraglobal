import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // Auth Check
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const adminDb = createAdminClient()
    // Fetch the single main webinar record (we assume there's only 1 for now)
    let { data: webinar, error } = await adminDb.from('marketing_webinars').select('*').limit(1).maybeSingle()
    
    if (!webinar) {
      // Fallback create if empty
      const { data: newW, error: err } = await adminDb.from('marketing_webinars').insert({
        title: 'Daily Wealth Masterclass',
        broadcast_mode: 'SIMULATED',
        scheduled_start_time: '20:00:00'
      }).select().single()
      webinar = newW
    }

    return NextResponse.json({ webinar })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (userData?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const adminDb = createAdminClient()
    
    const { data: webinar, error } = await adminDb.from('marketing_webinars')
      .update({
        title: body.title,
        video_url: body.video_url,
        youtube_live_url: body.youtube_live_url,
        broadcast_mode: body.broadcast_mode,
        scheduled_start_time: body.scheduled_start_time,
        is_active: body.is_active,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.id)
      .select().single()
      
    if (error) throw error

    return NextResponse.json({ webinar })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
