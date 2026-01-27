import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/home') || 
      req.nextUrl.pathname.startsWith('/interview')) {
    if (!session) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  // Auth routes (redirect if already logged in)
  if (req.nextUrl.pathname.startsWith('/sign-in') || 
      req.nextUrl.pathname.startsWith('/sign-up')) {
    if (session) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/home/:path*', '/interview/:path*', '/sign-in', '/sign-up'],
};
