import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'mk',
  
  // Locale detection based on user preference
  localeDetection: true
});

export const config = {
  // Match only internationalized pathnames, exclude API and auth routes
  matcher: [
    '/',
    '/(mk|en)/:path*',
    // Exclude API routes, auth routes, PWA files, and static files
    '/((?!api|auth|sw.js|manifest.json|icon-.*\\.png|_next/static|_next/image|favicon.ico).*)'
  ]
};
