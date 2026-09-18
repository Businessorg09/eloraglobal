import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data: profile } = await adminDb.from('users').select('role').eq('id', user.id).single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const { data: purchases, error } = await adminDb
      .from('package_purchases')
      .select(`
        *,
        user:users!package_purchases_user_id_fkey(full_name, username, email),
        package:packages!package_purchases_package_id_fkey(name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching purchases:', error)
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
    }

    return NextResponse.json({ purchases })
  } catch (error: any) {
    console.error('Admin purchases GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
