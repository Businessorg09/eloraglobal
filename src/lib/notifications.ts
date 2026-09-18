import { createAdminClient } from '@/lib/supabase/admin'

export type NotificationType = 'SYSTEM' | 'PAYOUT' | 'NETWORK' | 'SECURITY'

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType
) {
  try {
    const adminDb = createAdminClient()
    const { error } = await adminDb
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
      })

    if (error) {
      console.error('Failed to insert notification:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}
