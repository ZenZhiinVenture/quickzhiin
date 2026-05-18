import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('session-token')?.value;
  const isAuthRoute = /^\/(en|ms|zh)\/login/.test(pathname) || pathname === '/login';

  // If it's a dashboard route and user is not logged in, redirect to login
  if (!sessionToken && !isAuthRoute) {
    const localeMatch = pathname.match(/^\/(en|ms|zh)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If it's the login page and user IS logged in, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    const localeMatch = pathname.match(/^\/(en|ms|zh)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    // Redirect only if authenticated and on a login route
    const dashUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashUrl);
  }

  return request;
}

export const config = {
  // Match internationalized pathnames and exclusion patterns
  matcher: ['/', '/(en|ms|zh)/:path*', '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)']
};
