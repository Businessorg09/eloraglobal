import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { verifyPin, hashPin } from '@/lib/pin'

export async function POST(request: Request) {
  try {
    const { oldPin, newPin } = await request.json()

    if (!oldPin || !newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      return NextResponse.json({ error: 'New PIN must be exactly 6 digits.' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const adminDb = createAdminClient()

    // Fetch stored PIN hash
    const { data: userData, error: userError } = await adminDb
      .from('users')
      .select('transaction_pin_hash')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.transaction_pin_hash) {
      return NextResponse.json({ error: 'Failed to fetch user data or PIN not set.' }, { status: 500 })
    }

    // Verify old PIN
    const isValid = verifyPin(oldPin, userData.transaction_pin_hash)
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect old PIN.' }, { status: 403 })
    }

    // Hash the new PIN and save it
    const hashedPin = hashPin(newPin)

    const { error: updateError } = await adminDb
      .from('users')
      .update({ 
        transaction_pin_hash: hashedPin
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update PIN.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Transaction PIN successfully updated.' }, { status: 200 })

  } catch (error: any) {
    console.error('Change PIN Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
