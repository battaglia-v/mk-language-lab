export const CLOZE_TOKEN = '{{blank}}';

export type ClozeSplitResult = {
  segments: string[];
  hasBlank: boolean;
};

export function splitClozeSentence(sentence: string, token: string = CLOZE_TOKEN): ClozeSplitResult {
  if (!sentence) {
    return { segments: [''], hasBlank: false };
  }

  if (!sentence.includes(token)) {
    return { segments: [sentence], hasBlank: false };
  }

  return {
    segments: sentence.split(token),
    hasBlank: true,
  };
}
