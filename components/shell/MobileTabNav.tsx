"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildLocalizedHref, isNavItemActive, shellNavItems } from "./navItems";
import { triggerHaptic } from "@/lib/haptics";

/**
 * Routes where the mobile bottom nav should be hidden
 * These are immersive experiences (lessons, practice sessions, etc.)
 */
const HIDDEN_NAV_PATTERNS = [
  /\/lesson\/[^/]+$/, // /en/lesson/xyz or /mk/lesson/xyz
  /\/demo\/lesson-runner/, // Demo lesson runner
  /\/demo\/grammar-lesson/, // Demo grammar lesson
  /\/practice\/session/, // Practice sessions
  /\/practice\/grammar$/, // Grammar practice
  /\/practice\/fill-blanks$/, // Fill blanks practice
];

function shouldHideNav(pathname: string): boolean {
  return HIDDEN_NAV_PATTERNS.some(pattern => pattern.test(pathname));
}

export function MobileTabNav() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav during immersive lesson/practice flows
  if (shouldHideNav(pathname)) {
    return null;
  }

  const buildHref = (path: string) => buildLocalizedHref(locale, path, pathname);

  const handleNavClick = () => {
    triggerHaptic("light");
  };

  // Prefetch route on touch start (faster than hover on mobile)
  const handleTouchStart = (href: string) => {
    router.prefetch(href);
  };

  return (
    <nav
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-lg border-t border-border",
        "safe-area-bottom"
      )}
      aria-label={t("label")}
      data-testid="bottom-nav"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {shellNavItems.map((item) => {
          const Icon = item.icon;
          const href = buildHref(item.path);
          const isActive = isNavItemActive(pathname, href);
          const itemLabel = t(item.id);

          return (
            <Link
              key={item.id}
              href={href}
              prefetch={true}
              onClick={handleNavClick}
              onTouchStart={() => handleTouchStart(href)}
              data-testid={`nav-${item.id}`}
              aria-current={isActive ? "page" : undefined}
              aria-label={itemLabel}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "w-16 h-full transition-colors relative",
                "min-h-[48px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-95 transition-transform duration-100",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className="size-6"
                strokeWidth={isActive ? 2.2 : 1.8}
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{itemLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
