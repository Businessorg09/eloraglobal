import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Pages that require the user to be logged IN
const PROTECTED_ROUTES = ['/dashboard', '/tree', '/admin', '/trading']
// Pages that require the user to be logged OUT
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // For public pages (landing, etc.) — skip Supabase entirely, return immediately
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next()
  }

  // For protected or auth pages — do a quick session check
  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Race against a 5-second timeout so slow Supabase never blocks pages
    const { data: { user } } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      ),
    ])

    // Redirect unauthenticated users away from protected routes
    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role-based access control for admin routes
    if (user && pathname.startsWith('/admin')) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (profile?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Redirect authenticated users away from login/register
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

  } catch (_err) {
    // If Supabase times out or fails, allow the page to load anyway
    // The page itself will handle auth errors gracefully
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
