export type ReleaseGateMode = 'signed-out' | 'signed-in';

export function getReleaseGateMode(): ReleaseGateMode {
  const raw = (process.env.RELEASE_GATE_MODE ?? 'signed-out').trim();
  if (raw === 'signed-out' || raw === 'signed-in') return raw;
  throw new Error(`Invalid RELEASE_GATE_MODE: "${raw}" (expected signed-out | signed-in)`);
}

export function isSignedInMode(mode: ReleaseGateMode): boolean {
  return mode === 'signed-in';
}
