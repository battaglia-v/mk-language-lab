import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Locale detection based on user preference
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  // Add pathname header for all requests
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);

  // For admin routes, just return with the pathname header
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return response;
  }

  // For other routes, use intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all routes to ensure pathname header is set everywhere
  matcher: [
    '/',
    '/(mk|en)/:path*',
    '/admin/:path*',
    // Exclude API routes, auth routes, PWA files, icon routes, .well-known, and static files
    '/((?!api|auth|manifest.json|\\.well-known|icon|apple-icon|opengraph-image|icon-.*\\.png|_next/static|_next/image|favicon.ico).*)'
  ]
};
