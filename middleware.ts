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
  const { pathname } = request.nextUrl;

  // Redirect legacy /translator/history to /translate with history sheet
  if (pathname.match(/^\/(en|mk)\/translator\/history$/)) {
    const locale = pathname.split('/')[1];
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/translate`;
    url.searchParams.set('sheet', 'history');
    return NextResponse.redirect(url, 301);
  }

  // Add pathname header for all requests
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);

  // For admin routes, just return with the pathname header
  if (pathname.startsWith('/admin')) {
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
    '/((?!api|auth|manifest.json|\\.well-known|icon|apple-icon|opengraph-image|icon-.*\\.png|favicon.*|_next/static|_next/image).*)'
  ]
};
