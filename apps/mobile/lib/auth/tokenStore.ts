let currentToken: string | null = null;

export function setStoredAuthToken(token: string | null) {
  currentToken = token;
}

export function getStoredAuthToken() {
  return currentToken;
}
