import {
  Bell,
  BookOpen,
  CircleUserRound,
  Compass,
  Home,
  Languages,
  Newspaper,
  Sparkles,
} from "lucide-react";

export const shellNavItems = [
  { id: "dashboard", icon: Home, path: "/" },
  { id: "translate", icon: Languages, path: "/translate" },
  { id: "lessons", icon: Compass, path: "/discover" },
  { id: "practice", icon: Sparkles, path: "/practice" },
  { id: "news", icon: Newspaper, path: "/news" },
  { id: "resources", icon: BookOpen, path: "/resources" },
  { id: "notifications", icon: Bell, path: "/notifications" },
  { id: "profile", icon: CircleUserRound, path: "/profile" },
] as const;

export type ShellNavItem = (typeof shellNavItems)[number];
