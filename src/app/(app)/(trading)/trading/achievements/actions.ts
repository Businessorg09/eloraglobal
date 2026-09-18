'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getBadges() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', badges: [] }
  }

  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching badges:', error)
    return { error: error.message, badges: [] }
  }

  return { success: true, badges: data.map(b => b.badge_id) }
}

export async function unlockBadge(badgeId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Use insert with ON CONFLICT DO NOTHING to avoid duplicates if already unlocked
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: user.id, badge_id: badgeId })
    // In Supabase SQL we didn't specify ON CONFLICT DO NOTHING directly in the query, 
    // but we can catch the unique constraint error if it occurs, or just ignore it.
    // To be cleaner, we can check if it exists first.
  
  if (error && error.code !== '23505') { // 23505 is unique violation
    console.error('Error unlocking badge:', error)
    return { error: error.message }
  }

  revalidatePath('/trading/achievements')
  revalidatePath('/trading/passport')
  return { success: true }
}
