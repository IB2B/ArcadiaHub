import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  // Handle i18n routing first
  const intlResponse = intlMiddleware(request);

  // If it's a redirect, return it immediately
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // Get locale from pathname
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = pathname.split('/')[1];
  const locale = locales.includes(pathnameLocale as typeof locales[number]) ? pathnameLocale : defaultLocale;

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            intlResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/community',
    '/events',
    '/academy',
    '/documents',
    '/cases',
    '/blog',
    '/profile',
    '/settings',
    '/notifications',
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.includes(route));

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(`/${locale}/login`, request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if ((pathname.includes('/login') || pathname.includes('/register')) && user) {
    // Check role to redirect admin users to admin panel
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const dest = (profile?.role === 'ADMIN' || profile?.role === 'COMMERCIAL')
      ? `/${locale}/admin`
      : `/${locale}/dashboard`;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Add full URL to headers for server components to access
  intlResponse.headers.set('x-url', request.url);

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
