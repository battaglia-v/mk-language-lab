import type { Locator, Page } from '@playwright/test';
import { bypassNetworkInterstitial } from '../../e2e/helpers/network-interstitial';

export const INTERACTIVE_SELECTOR =
  'button:not([data-scan-exempt="true"]), a:not([data-scan-exempt="true"]), [role="button"]:not([data-scan-exempt="true"])';
export const TESTID_REQUIRED_SELECTOR =
  'button:not([data-scan-exempt="true"]), a:not([data-scan-exempt="true"]), [role="button"]:not([data-scan-exempt="true"]), input:not([data-scan-exempt="true"]), textarea:not([data-scan-exempt="true"]), select:not([data-scan-exempt="true"]), summary:not([data-scan-exempt="true"]), [role="link"]:not([data-scan-exempt="true"]), [role="tab"]:not([data-scan-exempt="true"]), [role="menuitem"]:not([data-scan-exempt="true"]), [role="switch"]:not([data-scan-exempt="true"]), [role="checkbox"]:not([data-scan-exempt="true"]), [role="radio"]:not([data-scan-exempt="true"])';

export async function safeGoto(page: Page, path: string): Promise<void> {
  const debug = process.env.RELEASE_GATE_DEBUG_NAV === 'true';
  if (debug) console.log(`[safeGoto] goto ${path}`);
  const attemptGoto = async () => page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  let response = await attemptGoto();
  const bypassed = await bypassNetworkInterstitial(page);
  if (bypassed) {
    response = await attemptGoto();
  }
  if (response) {
    const status = response.status();
    if (status >= 400) {
      throw new Error(`Navigation to ${path} failed with status ${status}`);
    }
  }
  // Keep this lightweight; many routes have background polling that prevents `networkidle`.
  await page.waitForTimeout(250);
  if (debug) console.log(`[safeGoto] done ${path} -> ${page.url()}`);
}

export async function getVisibleInteractives(pageOrScope: Page | Locator): Promise<Locator> {
  // Both Page and Locator have .locator() method
  return pageOrScope.locator(`${INTERACTIVE_SELECTOR}:visible`);
}

export async function getVisibleTestIdRequired(pageOrScope: Page | Locator): Promise<Locator> {
  return pageOrScope.locator(`${TESTID_REQUIRED_SELECTOR}:visible`);
}

export async function getStableLabel(locator: Locator): Promise<string> {
  try {
    const scanLabel = await locator.getAttribute('data-scan-label');
    if (scanLabel && scanLabel.trim()) return scanLabel.trim();
  } catch {}

  try {
    const aria = await locator.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();
  } catch {}

  try {
    const title = await locator.getAttribute('title');
    if (title && title.trim()) return title.trim();
  } catch {}

  try {
    const placeholder = await locator.getAttribute('placeholder');
    if (placeholder && placeholder.trim()) return placeholder.trim();
  } catch {}

  try {
    const value = await locator.getAttribute('value');
    if (value && value.trim()) return value.trim();
  } catch {}

  try {
    const text = await locator.innerText();
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned) return cleaned;
  } catch {}

  try {
    return await locator.evaluate((node) => {
      const el = node as HTMLElement;
      const alt = el.querySelector('img[alt]')?.getAttribute('alt');
      return alt?.trim() || el.tagName.toLowerCase();
    });
  } catch {}

  return 'unknown';
}

export async function getTagName(locator: Locator): Promise<string> {
  return locator.evaluate((node) => node.tagName.toLowerCase()).catch(() => 'unknown');
}

export async function getRole(locator: Locator): Promise<string | null> {
  return locator.getAttribute('role').catch(() => null);
}

export async function getHref(locator: Locator): Promise<string | null> {
  return locator.getAttribute('href').catch(() => null);
}

export async function isDisabled(locator: Locator): Promise<boolean> {
  try {
    if (await locator.isDisabled().catch(() => false)) return true;
    const ariaDisabled = await locator.getAttribute('aria-disabled');
    return ariaDisabled === 'true';
  } catch {
    return false;
  }
}

export async function instrumentActionSignals(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__mkllSignals = {
      audioPlayCalls: 0,
      speechSpeakCalls: 0,
      clipboardWrites: 0,
    };

    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      try {
        (window as any).__mkllSignals.audioPlayCalls += 1;
      } catch {}
      return originalPlay.apply(this, args);
    };

    const clipboard = navigator.clipboard as unknown as { writeText?: (...args: any[]) => any } | undefined;
    if (clipboard?.writeText) {
      const originalWriteText = clipboard.writeText.bind(clipboard);
      clipboard.writeText = async (...args: any[]) => {
        try {
          (window as any).__mkllSignals.clipboardWrites += 1;
        } catch {}
        return originalWriteText(...args);
      };
    }

    const synth = (window as any).speechSynthesis as SpeechSynthesis | undefined;
    if (synth?.speak) {
      const originalSpeak = synth.speak.bind(synth);
      synth.speak = (utterance: SpeechSynthesisUtterance) => {
        try {
          (window as any).__mkllSignals.speechSpeakCalls += 1;
        } catch {}
        return originalSpeak(utterance);
      };
    }
  });
}

export async function getSignalSnapshot(
  page: Page
): Promise<{ audioPlayCalls: number; speechSpeakCalls: number; clipboardWrites: number }> {
  return page
    .evaluate(() => {
      const signals = (window as any).__mkllSignals;
      return {
        audioPlayCalls: Number(signals?.audioPlayCalls || 0),
        speechSpeakCalls: Number(signals?.speechSpeakCalls || 0),
        clipboardWrites: Number(signals?.clipboardWrites || 0),
      };
    })
    .catch(() => ({ audioPlayCalls: 0, speechSpeakCalls: 0, clipboardWrites: 0 }));
}

export async function getOverlaySignature(page: Page): Promise<{ openCount: number }> {
  const selectors = [
    '[role="dialog"]',
    '[role="alertdialog"]',
    '[data-state="open"]',
    '[aria-expanded="true"]',
    '[data-radix-popper-content-wrapper]',
  ];
  let openCount = 0;
  for (const selector of selectors) {
    openCount += await page.locator(`${selector}:visible`).count().catch(() => 0);
  }
  return { openCount };
}

export async function closeOverlays(page: Page): Promise<void> {
  // Radix components typically close on Escape.
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);
}

export async function getDomSignature(page: Page): Promise<{ textLength: number; activeElementTag: string | null }> {
  return page.evaluate(() => {
    const textLength = document.body?.innerText?.length ?? 0;
    const active = document.activeElement;
    const activeElementTag = active ? active.tagName.toLowerCase() : null;
    return { textLength, activeElementTag };
  });
}
