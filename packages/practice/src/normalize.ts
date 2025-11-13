export const normalizeAnswer = (value: string) =>
  value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
