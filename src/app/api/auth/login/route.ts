import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Trigger Login Notification
    if (data.user?.id) {
      import('@/lib/notifications').then(({ createNotification }) => {
        createNotification(
          data.user.id,
          'New Login Detected',
          `A new login was detected on your account at ${new Date().toLocaleString()}. If this wasn't you, please change your password immediately.`,
          'SECURITY'
        ).catch(console.error);
      });
    }

    return NextResponse.json({
      message: 'Login successful!',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error: any) {
    console.error('Login API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
