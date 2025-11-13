const RAW_API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.EXPO_PUBLIC_SITE_URL ??
    '').trim();

const NORMALIZED_API_BASE = RAW_API_BASE.length > 0 ? RAW_API_BASE.replace(/\/$/, '') : null;

export function getApiBaseUrl(): string | null {
  return NORMALIZED_API_BASE;
}

export function buildApiUrl(path: string): string | null {
  if (!NORMALIZED_API_BASE) {
    return null;
  }

  const cleanedPath = path.startsWith('/') ? path : `/${path}`;
  return `${NORMALIZED_API_BASE}${cleanedPath}`;
}

export function requireApiBaseUrl(): string {
  if (!NORMALIZED_API_BASE) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured.');
  }
  return NORMALIZED_API_BASE;
}
