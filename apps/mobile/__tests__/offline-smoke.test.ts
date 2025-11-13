import { describe, expect, it } from 'vitest';
import {
  getLocalMissionStatus,
  getLocalProfileSummary,
  getLocalPracticePrompts,
} from '@mk/api-client';

describe('Offline smoke data for mobile flows', () => {
  it('provides a mission hero payload with checklist, stats, and CTA links', () => {
    const mission = getLocalMissionStatus();
    expect(mission.name.length).toBeGreaterThan(0);
    expect(mission.checklist.length).toBeGreaterThan(0);
    expect(mission.coachTips.length).toBeGreaterThan(0);
    expect(mission.xp.target).toBeGreaterThan(mission.xp.earned);
    expect(mission.links?.practice).toBeDefined();
  });

  it('exposes profile fallback stats for onboarding and badge flows', () => {
    const profile = getLocalProfileSummary();
    expect(profile.xp.total).toBeGreaterThan(0);
    expect(profile.streakDays).toBeGreaterThanOrEqual(0);
    expect(profile.quests.active).toBeGreaterThanOrEqual(0);
    expect(profile.badges.length).toBeGreaterThan(0);
  });

  it('bundles a practice deck so Quick Practice works offline with audio metadata', () => {
    const prompts = getLocalPracticePrompts(5);
    expect(prompts.length).toBeGreaterThan(0);
    for (const item of prompts) {
      expect(item.macedonian?.length ?? 0).toBeGreaterThan(0);
      expect(item.english?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
