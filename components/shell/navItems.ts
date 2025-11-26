import { Home, Languages, Sparkles, Newspaper, BookOpen, CircleUserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItemId = "dashboard" | "translate" | "practice" | "news" | "resources" | "profile";

export type ShellNavItem = {
  id: NavItemId;
  path: string;
  icon: LucideIcon;
};

export const shellNavItems: ShellNavItem[] = [
  { id: "dashboard", path: "/dashboard", icon: Home },
  { id: "translate", path: "/translate", icon: Languages },
  { id: "practice", path: "/practice", icon: Sparkles },
  { id: "news", path: "/news", icon: Newspaper },
  { id: "resources", path: "/resources", icon: BookOpen },
  { id: "profile", path: "/profile", icon: CircleUserRound },
];

export const buildLocalizedHref = (locale: string, path: string) =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;
