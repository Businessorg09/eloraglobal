import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim().toUpperCase()

  if (!code) {
    return NextResponse.json({ error: 'Sponsor code is required.' }, { status: 400 })
  }

  try {
    const adminDb = createAdminClient()

    // Look up the user by referral_code OR username (case insensitive)
    const { data: sponsor, error } = await adminDb
      .from('users')
      .select('id, full_name, username, referral_code, is_active')
      .or(`referral_code.eq.${code},username.ilike.${code}`)
      .maybeSingle()

    if (error) {
      console.error('Sponsor lookup error:', error)
      return NextResponse.json({ error: 'Database error.' }, { status: 500 })
    }

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor code not found.' }, { status: 404 })
    }

    if (!sponsor.is_active) {
      return NextResponse.json({ error: 'Sponsor account is inactive.' }, { status: 404 })
    }

    // Get rank from user_ranks table
    const { data: rankData } = await adminDb
      .from('user_ranks')
      .select('current_rank')
      .eq('user_id', sponsor.id)
      .maybeSingle()

    return NextResponse.json({
      full_name: sponsor.full_name,
      username: sponsor.username,
      referral_code: sponsor.referral_code,
      rank: rankData?.current_rank || 'BRONZE',
    })
  } catch (err: any) {
    console.error('Verify sponsor error:', err)
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 })
  }
}
