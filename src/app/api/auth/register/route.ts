import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolvePlacement, buildChildPath } from '@/lib/engines/binary-tree'

export async function POST(request: Request) {
  try {
    const { email, password, fullName, username, phone, referredBy, referredPosition, source, country } = await request.json()

    if (!email || !password || !fullName || !username) {
      return NextResponse.json(
        { error: 'Email, password, full name, and username are required.' },
        { status: 400 }
      )
    }

    // Use admin client (service role) for all DB operations - most reliable
    const adminDb = createAdminClient()

    let referrerId: string | null = null

    // 1. Resolve referrer UUID if referral code provided
    if (referredBy) {
      const { data: referrer, error: referrerError } = await adminDb
        .from('users')
        .select('id')
        .or(`referral_code.eq.${referredBy.trim().toUpperCase()},username.ilike.${referredBy.trim()}`)
        .maybeSingle()

      if (referrerError) {
        console.error('Error resolving referral code:', referrerError)
      } else if (referrer) {
        referrerId = referrer.id
      } else {
        return NextResponse.json(
          { error: 'Invalid referral code. Please check and try again.' },
          { status: 400 }
        )
      }
    }

    // 2. Check username is not taken
    const { data: existingUsername } = await adminDb
      .from('users')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()

    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 400 })
    }

    // 3. Register user via Supabase Auth (use service role admin for auth)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

      const validPosition = (referredPosition === 'L' || referredPosition === 'R') ? referredPosition : null;

      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm so no email verification needed during dev
        user_metadata: {
          full_name: fullName,
          username: username.trim().toLowerCase(),
          phone: phone || null,
          referred_by: referrerId,
          referred_position: validPosition,
        },
      })

    if (signUpError) {
      console.error('SUPABASE SIGNUP ERROR:', signUpError)
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user account.' }, { status: 500 })
    }

    // --- MLM PLACEMENT LOGIC FOR FREE USERS ---
    if (referrerId) {
      try {
        const validPosition = (referredPosition === 'L' || referredPosition === 'R') ? referredPosition : undefined;
        const placement = await resolvePlacement(adminDb, referrerId, validPosition)
        const { data: parentNode } = await adminDb.from('binary_nodes').select('path').eq('id', placement.parentId).single()
        const nodePath = buildChildPath(parentNode?.path || '', placement.position, authData.user.id)
        
        const { data: sponsorNode } = await adminDb.from('binary_nodes').select('id').eq('user_id', referrerId).maybeSingle()
        
        const { data: newNode, error: nodeError } = await adminDb.from('binary_nodes').insert({
          user_id: authData.user.id,
          sponsor_id: sponsorNode?.id || null,
          parent_id: placement.parentId,
          position: placement.position,
          path: nodePath,
          is_active: false,
        }).select().single()

        if (newNode) {
          await adminDb.from('binary_node_volumes').insert({
            node_id: newNode.id,
            binary_income_limit_paise: 0,
            is_binary_earning_active: false
          })
          
          // --- CAPTURE MARKETING LEAD SOURCE ---
          let dbSource = 'OTHER';
          const srcLower = (source || '').toLowerCase();
          if (srcLower === 'wsp' || srcLower === 'whatsapp') dbSource = 'WHATSAPP';
          else if (srcLower === 'tg' || srcLower === 'telegram') dbSource = 'TELEGRAM';
          else if (srcLower === 'fb' || srcLower === 'facebook') dbSource = 'FACEBOOK';
          else if (srcLower === 'email') dbSource = 'EMAIL';
          
          await adminDb.from('marketing_leads').insert({
            sponsor_id: referrerId,
            name: fullName,
            contact_info: email,
            location: country || 'Unknown',
            source: dbSource,
            status: 'REGISTERED',
            last_action: 'Completed Registration'
          });
          
          // --- SEND NOTIFICATION TO SPONSOR ---
          import('@/lib/notifications').then(({ createNotification }) => {
            createNotification(
              referrerId,
              'New Downline Registration',
              `${fullName} (@${username.trim().toLowerCase()}) has registered in your network and was placed on your ${placement.position === 'L' ? 'Left' : 'Right'} Leg.`,
              'NETWORK'
            ).catch(console.error);
          });
        }
      } catch (placementErr) {
        console.error('Failed to place free user in tree:', placementErr)
      }
    }

    return NextResponse.json({
      message: 'Account created successfully! You can now log in.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error: any) {
    console.error('Registration API Error:', error)
    return NextResponse.json(
      { error: error.message?.includes('fetch') ? 'Cannot connect to database. Please check your internet connection.' : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
