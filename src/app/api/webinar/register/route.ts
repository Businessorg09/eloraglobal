import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, sponsorUsername } = await request.json()

    if (!name || !email || !sponsorUsername) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminDb = createAdminClient()

    // 1. Find the active webinar
    const { data: webinar } = await adminDb
      .from('marketing_webinars')
      .select('id, is_active')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!webinar) {
      return NextResponse.json({ error: 'No active webinar currently available' }, { status: 404 })
    }

    // 2. Find the sponsor
    const { data: sponsor } = await adminDb
      .from('users')
      .select('id')
      .ilike('username', sponsorUsername)
      .maybeSingle()

    if (!sponsor) {
      return NextResponse.json({ error: 'Invalid sponsor or referral link' }, { status: 404 })
    }

    // 3. Upsert the lead (update if they already registered before with same email+sponsor)
    const { error: leadError } = await adminDb
      .from('marketing_webinar_leads')
      .upsert({
        webinar_id: webinar.id,
        sponsor_id: sponsor.id,
        name: name,
        email: email.toLowerCase()
      }, { onConflict: 'email,sponsor_id' })

    if (leadError) {
      console.error('Lead error:', leadError)
      return NextResponse.json({ error: 'Failed to register lead' }, { status: 500 })
    }

    // Pass back the sponsorId and webinarId to allow entry
    return NextResponse.json({ 
      success: true, 
      webinarId: webinar.id,
      sponsorId: sponsor.id 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
