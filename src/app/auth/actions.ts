'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const sponsorCode = formData.get('sponsorCode') as string
  const country = formData.get('country') as string
  const legChoice = formData.get('legChoice') as string

  if (!email || !password || !fullName) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        sponsor_code: sponsorCode,
        country: country,
        leg_choice: legChoice,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInAction(prevState: any, formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const destination = formData.get('destination') as string || '/dashboard'

  if (!identifier || !password) {
    return { error: 'Missing identifier or password' }
  }

  let email = identifier

  if (!email.includes('@')) {
    // If it's a username (like INFG0123), lookup the email
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminDb = createAdminClient()
    const { data: userRecord } = await adminDb.from('users').select('email').eq('username', identifier.toLowerCase()).single()
    
    if (!userRecord || !userRecord.email) {
      return { error: 'Invalid User ID or Password' }
    }
    email = userRecord.email
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(destination)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}
