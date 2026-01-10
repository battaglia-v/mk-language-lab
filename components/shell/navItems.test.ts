import { describe, expect, it } from "vitest";

import { buildLocalizedHref, isNavItemActive, shellNavItems, splitLocaleFromPathname } from "./navItems";

describe("buildLocalizedHref", () => {
  it("uses the provided locale for standard paths", () => {
    expect(buildLocalizedHref("mk", "/dashboard")).toBe("/mk/dashboard");
  });

  it("preserves an existing locale on the path", () => {
    expect(buildLocalizedHref("mk", "/en/practice")).toBe("/en/practice");
  });

  it("falls back to the current pathname locale when provided", () => {
    expect(buildLocalizedHref("mk", "/practice", "/en/news"))
      .toBe("/en/practice");
  });

  it("normalizes the root path", () => {
    expect(buildLocalizedHref("en", "/", "/mk/dashboard")).toBe("/mk");
  });
});

describe("isNavItemActive", () => {
  it("matches the exact pathname", () => {
    expect(isNavItemActive("/mk/dashboard", "/mk/dashboard")).toBe(true);
  });

  it("matches nested paths", () => {
    expect(isNavItemActive("/mk/dashboard/overview", "/mk/dashboard")).toBe(true);
  });

  it("ignores locale prefixes when comparing", () => {
    expect(isNavItemActive("/dashboard", "/mk/dashboard")).toBe(true);
  });

  it("returns false for unrelated paths", () => {
    expect(isNavItemActive("/mk/practice", "/mk/dashboard")).toBe(false);
  });
});

describe("shellNavItems", () => {
  it("generates localized hrefs for each nav item without duplication", () => {
    const pathname = "/en/dashboard";
    const hrefs = shellNavItems.map(({ path }) => buildLocalizedHref("en", path, pathname));

    expect(new Set(hrefs).size).toBe(shellNavItems.length);
    expect(hrefs).toContain("/en/resources");
  });

  it("can strip locales from nav paths for comparison", () => {
    expect(splitLocaleFromPathname("/mk/resources")).toEqual({ locale: "mk", pathname: "/resources" });
    expect(splitLocaleFromPathname("/practice")).toEqual({ locale: undefined, pathname: "/practice" });
  });
});
