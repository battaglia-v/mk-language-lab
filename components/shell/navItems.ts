import { Home, Languages, Sparkles, BookOpen, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItemId = "learn" | "translate" | "practice" | "reader" | "more";

export type ShellNavItem = {
  id: NavItemId;
  path: string;
  icon: LucideIcon;
};

// Primary tabs: Home, Translate, Practice (center), Reader, More
export const shellNavItems: ShellNavItem[] = [
  { id: "learn", path: "/learn", icon: Home },
  { id: "translate", path: "/translate", icon: Languages },
  { id: "practice", path: "/practice", icon: Sparkles },
  { id: "reader", path: "/reader", icon: BookOpen },
  { id: "more", path: "/more", icon: MoreHorizontal },
];

const supportedLocales = ["en", "mk"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

const normalizePathname = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const splitLocaleFromPathname = (pathname: string) => {
  const normalized = normalizePathname(pathname);
  const localeMatch = normalized.match(new RegExp(`^/(${supportedLocales.join("|")})(?=/|$)`, "i"));

  if (!localeMatch) {
    return { locale: undefined as SupportedLocale | undefined, pathname: normalized };
  }

  const locale = localeMatch[1].toLowerCase() as SupportedLocale;
  const remainder = normalized.slice(localeMatch[0].length) || "/";

  return { locale, pathname: remainder };
};

export const buildLocalizedHref = (locale: string, path: string, currentPathname?: string) => {
  const target = splitLocaleFromPathname(normalizePathname(path));
  const current = currentPathname ? splitLocaleFromPathname(currentPathname) : { locale: undefined };

  const resolvedLocale = (target.locale ?? current.locale ?? locale).toLowerCase();

  return target.pathname === "/" ? `/${resolvedLocale}` : `/${resolvedLocale}${target.pathname}`;
};

export const isNavItemActive = (pathname: string, href: string) => {
  const current = splitLocaleFromPathname(normalizePathname(pathname));
  const target = splitLocaleFromPathname(normalizePathname(href));

  return current.pathname === target.pathname || current.pathname.startsWith(`${target.pathname}/`);
};
