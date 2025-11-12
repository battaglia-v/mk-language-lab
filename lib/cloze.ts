export const CLOZE_TOKEN = '{{blank}}';

export type ClozeSplitResult = {
  segments: string[];
  hasBlank: boolean;
};

/**
 * Split a cloze sentence on the `{{blank}}` token so UI layers can render
 * the missing word placeholder between text segments.
 */
export function splitClozeSentence(sentence: string): ClozeSplitResult {
  if (!sentence) {
    return { segments: [''], hasBlank: false };
  }

  if (!sentence.includes(CLOZE_TOKEN)) {
    return { segments: [sentence], hasBlank: false };
  }

  return {
    segments: sentence.split(CLOZE_TOKEN),
    hasBlank: true,
  };
}
