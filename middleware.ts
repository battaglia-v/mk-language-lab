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
  // Match only internationalized pathnames
  matcher: ['/', '/(mk|en)/:path*']
};
