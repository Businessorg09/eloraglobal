'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTrade(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const asset = formData.get('asset') as string
  const direction = formData.get('direction') as string
  const lots = parseFloat(formData.get('lots') as string)
  const pnl = parseFloat(formData.get('pnl') as string)
  const psychology = formData.get('psychology') as string
  const notes = formData.get('notes') as string
  const entryPrice = formData.get('entryPrice') ? parseFloat(formData.get('entryPrice') as string) : null
  const exitPrice = formData.get('exitPrice') ? parseFloat(formData.get('exitPrice') as string) : null
  const executionTime = formData.get('executionTime') as string || new Date().toISOString()

  if (!asset || !direction || isNaN(lots) || isNaN(pnl)) {
    return { error: 'Missing required fields' }
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      asset,
      direction,
      lot_size: lots,
      pnl,
      psychology_state: psychology,
      notes,
      entry_price: entryPrice,
      exit_price: exitPrice,
      execution_time: executionTime
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding trade:', error)
    return { error: error.message }
  }

  revalidatePath('/trading/journal')
  return { success: true, trade: data }
}

export async function getTrades() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', trades: [] }
  }

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('execution_time', { ascending: false })

  if (error) {
    console.error('Error fetching trades:', error)
    return { error: error.message, trades: [] }
  }

  return { success: true, trades: data }
}
