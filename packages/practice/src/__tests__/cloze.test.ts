import { describe, expect, it } from 'vitest';
import { splitClozeSentence, CLOZE_TOKEN } from '../cloze';

describe('splitClozeSentence', () => {
  it('returns single segment when no token is present', () => {
    const result = splitClozeSentence('Hello there');
    expect(result).toEqual({ segments: ['Hello there'], hasBlank: false });
  });

  it('splits on a single cloze token', () => {
    const sentence = `I say ${CLOZE_TOKEN} every morning.`;
    const result = splitClozeSentence(sentence);
    expect(result.hasBlank).toBe(true);
    expect(result.segments).toEqual(['I say ', ' every morning.']);
  });

  it('handles multiple blanks gracefully', () => {
    const sentence = `${CLOZE_TOKEN} or ${CLOZE_TOKEN}, choose wisely.`;
    const result = splitClozeSentence(sentence);
    expect(result.hasBlank).toBe(true);
    expect(result.segments).toEqual(['', ' or ', ', choose wisely.']);
  });

  it('returns empty segment for falsy input', () => {
    const result = splitClozeSentence('');
    expect(result).toEqual({ segments: [''], hasBlank: false });
  });
});
