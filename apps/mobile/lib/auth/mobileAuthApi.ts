import { getApiBaseUrl } from '../../lib/api';
import type { AuthUser } from './AuthProvider';

type LoginResponse = {
  token: string;
  expiresAt: string;
  user: AuthUser & { role?: string | null };
};

export async function loginWithEmailPassword(credentials: {
  email: string;
  password: string;
}) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Missing API base URL. Set EXPO_PUBLIC_API_BASE_URL to enable authentication.');
  }

  const response = await fetch(`${baseUrl}/api/mobile/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new Error(message ?? 'Unable to sign in');
  }

  return (await response.json()) as LoginResponse;
}

export async function fetchMobileUser(authToken: string) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Missing API base URL.');
  }

  const response = await fetch(`${baseUrl}/api/mobile/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { user: AuthUser };
  return payload.user;
}

async function safeParseError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error;
  } catch {
    return response.statusText;
  }
}
