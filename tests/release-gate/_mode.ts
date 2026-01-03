export type ReleaseGateMode = 'signed-out' | 'signed-in' | 'premium';

export function getReleaseGateMode(): ReleaseGateMode {
  const raw = (process.env.RELEASE_GATE_MODE ?? 'signed-out').trim();
  if (raw === 'signed-out' || raw === 'signed-in' || raw === 'premium') return raw;
  throw new Error(`Invalid RELEASE_GATE_MODE: "${raw}" (expected signed-out | signed-in | premium)`);
}

export function isPremiumMode(mode: ReleaseGateMode): boolean {
  return mode === 'premium';
}

export function isSignedInMode(mode: ReleaseGateMode): boolean {
  return mode === 'signed-in' || mode === 'premium';
}

