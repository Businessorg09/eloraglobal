'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCourseProgress() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', progress: [] }
  }

  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching course progress:', error)
    return { error: error.message, progress: [] }
  }

  return { success: true, progress: data }
}

export async function updateModuleProgress(moduleId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED', timeSpent: number = 0, score: number | null = null) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Use upsert to insert or update the progress for this module
  const { error } = await supabase
    .from('course_progress')
    .upsert({
      user_id: user.id,
      module_id: moduleId,
      status: status,
      time_spent_minutes: timeSpent,
      score: score,
      last_accessed_at: new Date().toISOString()
    }, { onConflict: 'user_id, module_id' })

  if (error) {
    console.error('Error updating course progress:', error)
    return { error: error.message }
  }

  revalidatePath('/trading/analytics')
  return { success: true }
}
