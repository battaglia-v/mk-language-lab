import { getStoredAuthToken } from './tokenStore';

type FetchInput = RequestInfo | URL;

export function authenticatedFetch(input: FetchInput, init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {});
  const token = getStoredAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}
