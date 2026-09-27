import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminDb = createAdminClient()
    
    const { data: webinar } = await adminDb
      .from('marketing_webinars')
      .select('id, title, video_url, youtube_live_url, broadcast_mode, scheduled_start_time, is_active')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!webinar) {
      return NextResponse.json({ error: 'No active webinar currently available' }, { status: 404 })
    }

    return NextResponse.json({ webinar })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
