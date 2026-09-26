import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!userData || userData.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const adminDb = createAdminClient()
    let query = adminDb
      .from('support_tickets')
      .select('*, users!inner(full_name, email, username)')
      .order('created_at', { ascending: false })
      
    if (status && status !== 'ALL') {
      query = query.eq('status', status)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to fetch tickets.' }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!userData || userData.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const body = await request.json()
    const { ticketId, status } = body

    if (!ticketId || !status) {
      return NextResponse.json({ error: 'Ticket ID and status are required.' }, { status: 400 })
    }

    const adminDb = createAdminClient()
    const { data: ticket, error } = await adminDb
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to update ticket.' }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
