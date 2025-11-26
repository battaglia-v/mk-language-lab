import { LayoutDashboard, Languages, Sparkles, Newspaper, BookOpen, CircleUserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItemId = "dashboard" | "translate" | "practice" | "news" | "resources" | "profile";

export type ShellNavItem = {
  id: NavItemId;
  path: string;
  icon: LucideIcon;
};

export const shellNavItems: ShellNavItem[] = [
  { id: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "translate", path: "/translate", icon: Languages },
  { id: "practice", path: "/practice", icon: Sparkles },
  { id: "news", path: "/news", icon: Newspaper },
  { id: "resources", path: "/resources", icon: BookOpen },
  { id: "profile", path: "/profile", icon: CircleUserRound },
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
