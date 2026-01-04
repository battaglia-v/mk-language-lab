import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export type E2EAuthUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  image?: string | null;
  role?: string;
};

const STORE_KEY = '__mkll_e2e_auth_users__';

function getStore(): Map<string, E2EAuthUser> {
  const globalAny = globalThis as unknown as Record<string, unknown>;
  const existing = globalAny[STORE_KEY] as Map<string, E2EAuthUser> | undefined;
  if (existing) return existing;
  const created = new Map<string, E2EAuthUser>();
  globalAny[STORE_KEY] = created;
  return created;
}

export function isE2EAuthEnabled(): boolean {
  return process.env.MKLL_E2E_AUTH === 'true';
}

export async function upsertE2EUser(input: { email: string; name: string; password: string }): Promise<E2EAuthUser> {
  const store = getStore();
  const existing = store.get(input.email);
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user: E2EAuthUser = {
    id: crypto.randomUUID(),
    email: input.email,
    name: input.name,
    passwordHash,
    role: 'user',
  };
  store.set(input.email, user);
  return user;
}

export async function verifyE2EUser(email: string, password: string): Promise<E2EAuthUser | null> {
  const store = getStore();
  const user = store.get(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

