import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyPin } from '@/lib/pin'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN format.' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Fetch stored PIN hash using admin client to bypass RLS
    const adminDb = createAdminClient()
    const { data: userData, error: userError } = await adminDb
      .from('users')
      .select('transaction_pin_hash')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Failed to fetch user data.' }, { status: 500 })
    }

    if (!userData.transaction_pin_hash) {
      return NextResponse.json({ error: 'Transaction PIN is not set. Please set it in Settings first.' }, { status: 400 })
    }

    // Verify PIN
    const isValid = verifyPin(pin, userData.transaction_pin_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect PIN.' }, { status: 403 })
    }

    return NextResponse.json({ verified: true }, { status: 200 })

  } catch (error: any) {
    console.error('Verify PIN Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
