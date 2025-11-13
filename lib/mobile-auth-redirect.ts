const ALLOWED_SCHEMES = new Set(['mkll', 'exp']);

export function isAllowedMobileRedirect(redirectUri: string): boolean {
  try {
    const parsed = new URL(redirectUri);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    }

    const scheme = parsed.protocol.replace(':', '').toLowerCase();
    if (!scheme) {
      return false;
    }

    return ALLOWED_SCHEMES.has(scheme);
  } catch {
    return false;
  }
}
