import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { hashPin } from '@/lib/pin'

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits.' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const adminDb = createAdminClient()

    // Check if PIN is already set
    const { data: userData, error: userError } = await adminDb
      .from('users')
      .select('transaction_pin_hash')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data.' }, { status: 500 })
    }

    if (userData.transaction_pin_hash) {
      return NextResponse.json({ error: 'Transaction PIN is already set. Use the change API.' }, { status: 400 })
    }

    // Hash the PIN and save it
    const hashedPin = hashPin(pin)

    const { error: updateError } = await adminDb
      .from('users')
      .update({ 
        transaction_pin_hash: hashedPin
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save PIN.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Transaction PIN successfully created.' }, { status: 200 })

  } catch (error: any) {
    console.error('Setup PIN Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
