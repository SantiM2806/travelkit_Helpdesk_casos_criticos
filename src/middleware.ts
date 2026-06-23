import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Public routes: no auth required
const PUBLIC_PREFIXES = ['/solicitud', '/auth/callback', '/auth/reset-password', '/api/'];

export async function middleware(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase env vars');
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string | undefined;

  const isLoginPage = pathname.startsWith('/login');
  const isExecutive = pathname.startsWith('/executive');
  const isRoot      = pathname === '/';

  // No session → redirect to login
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Already logged in on login page → redirect to landing
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    // Admin and developer both land on /  (admin sees Hub, developer sees Pipeline)
    url.pathname = role === 'executive' ? '/executive' : '/';
    return NextResponse.redirect(url);
  }

  // Executive cannot access root pipeline/hub
  if (user && isRoot && role === 'executive') {
    const url = request.nextUrl.clone();
    url.pathname = '/executive';
    return NextResponse.redirect(url);
  }

  // Developer cannot access executive
  if (user && isExecutive && role === 'developer') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
