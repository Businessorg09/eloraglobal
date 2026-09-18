import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json({ error: 'Failed to fetch tickets.' }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error: any) {
    console.error('Support Tickets GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { category, subject, description, priority, attachments } = body

    if (!category || !subject || !description) {
      return NextResponse.json({ error: 'Category, subject, and description are required.' }, { status: 400 })
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        category,
        subject,
        description,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        attachments: attachments || []
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json({ error: 'Failed to create ticket.' }, { status: 500 })
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error: any) {
    console.error('Support Tickets POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
