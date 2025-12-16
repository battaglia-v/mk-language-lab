import { describe, expect, it } from 'vitest';
import { normalizeAnswer } from '../normalize';

const cases: Array<{ input: string; expected: string }> = [
  { input: '  Здраво  ', expected: 'здраво' },
  { input: 'GoRDost!', expected: 'gordost' },
  { input: 'makedonski (lang)', expected: 'makedonski' },
  { input: 'multi   space', expected: 'multi space' },
  { input: 'AccentÊd', expected: 'accented' }, // diacritics stripped for flexible matching
];

describe('normalizeAnswer', () => {
  it.each(cases)('normalizes "$input"', ({ input, expected }) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });

  it('handles punctuation and casing consistently', () => {
    const base = 'Добар ден!';
    const variant = 'добар ден';
    expect(normalizeAnswer(base)).toBe(normalizeAnswer(variant));
  });
});
