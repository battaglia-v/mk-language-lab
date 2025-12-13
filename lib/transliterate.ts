/**
 * Transliterate Macedonian Cyrillic to Latin script
 * Based on standard Macedonian romanization rules
 */
export function cyrillicToLatin(text: string): string {
  const transliterationMap: Record<string, string> = {
    // Lowercase
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'ѓ': 'gj',
    'е': 'e',
    'ж': 'zh',
    'з': 'z',
    'ѕ': 'dz',
    'и': 'i',
    'ј': 'j',
    'к': 'k',
    'л': 'l',
    'љ': 'lj',
    'м': 'm',
    'н': 'n',
    'њ': 'nj',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'ќ': 'kj',
    'у': 'u',
    'ф': 'f',
    'х': 'h',
    'ц': 'c',
    'ч': 'ch',
    'џ': 'dzh',
    'ш': 'sh',

    // Uppercase
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'G',
    'Д': 'D',
    'Ѓ': 'Gj',
    'Е': 'E',
    'Ж': 'Zh',
    'З': 'Z',
    'Ѕ': 'Dz',
    'И': 'I',
    'Ј': 'J',
    'К': 'K',
    'Л': 'L',
    'Љ': 'Lj',
    'М': 'M',
    'Н': 'N',
    'Њ': 'Nj',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'Ќ': 'Kj',
    'У': 'U',
    'Ф': 'F',
    'Х': 'H',
    'Ц': 'C',
    'Ч': 'Ch',
    'Џ': 'Dzh',
    'Ш': 'Sh',
  };

  let result = '';
  for (const char of text) {
    result += transliterationMap[char] || char;
  }

  return result;
}

/**
 * Transliterate Latin script to Macedonian Cyrillic
 * Handles digraphs (lj, nj, dz, etc.) and common variations
 */
export function latinToCyrillic(text: string): string {
  // Order matters! Process digraphs first, then single characters
  const transliterationMap: Array<[string, string]> = [
    // Digraphs (must be processed first, case-sensitive)
    ['Dzh', 'Џ'],
    ['dzh', 'џ'],
    ['DZH', 'Џ'],
    ['Gj', 'Ѓ'],
    ['gj', 'ѓ'],
    ['GJ', 'Ѓ'],
    ['Kj', 'Ќ'],
    ['kj', 'ќ'],
    ['KJ', 'Ќ'],
    ['Lj', 'Љ'],
    ['lj', 'љ'],
    ['LJ', 'Љ'],
    ['Nj', 'Њ'],
    ['nj', 'њ'],
    ['NJ', 'Њ'],
    ['Zh', 'Ж'],
    ['zh', 'ж'],
    ['ZH', 'Ж'],
    ['Sh', 'Ш'],
    ['sh', 'ш'],
    ['SH', 'Ш'],
    ['Ch', 'Ч'],
    ['ch', 'ч'],
    ['CH', 'Ч'],
    ['Dz', 'Ѕ'],
    ['dz', 'ѕ'],
    ['DZ', 'Ѕ'],
    
    // Single characters - lowercase
    ['a', 'а'],
    ['b', 'б'],
    ['v', 'в'],
    ['g', 'г'],
    ['d', 'д'],
    ['e', 'е'],
    ['z', 'з'],
    ['i', 'и'],
    ['j', 'ј'],
    ['k', 'к'],
    ['l', 'л'],
    ['m', 'м'],
    ['n', 'н'],
    ['o', 'о'],
    ['p', 'п'],
    ['r', 'р'],
    ['s', 'с'],
    ['t', 'т'],
    ['u', 'у'],
    ['f', 'ф'],
    ['h', 'х'],
    ['c', 'ц'],
    
    // Single characters - uppercase
    ['A', 'А'],
    ['B', 'Б'],
    ['V', 'В'],
    ['G', 'Г'],
    ['D', 'Д'],
    ['E', 'Е'],
    ['Z', 'З'],
    ['I', 'И'],
    ['J', 'Ј'],
    ['K', 'К'],
    ['L', 'Л'],
    ['M', 'М'],
    ['N', 'Н'],
    ['O', 'О'],
    ['P', 'П'],
    ['R', 'Р'],
    ['S', 'С'],
    ['T', 'Т'],
    ['U', 'У'],
    ['F', 'Ф'],
    ['H', 'Х'],
    ['C', 'Ц'],
  ];

  let result = text;
  for (const [latin, cyrillic] of transliterationMap) {
    result = result.split(latin).join(cyrillic);
  }

  return result;
}

/**
 * Check if text contains Cyrillic characters
 */
export function containsCyrillic(text: string): boolean {
  // Macedonian Cyrillic range
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Check if text is primarily Latin (no Cyrillic)
 */
export function isLatinScript(text: string): boolean {
  return !containsCyrillic(text);
}

/**
 * Ensure text is in Cyrillic. If Latin, convert it.
 */
export function ensureCyrillic(text: string): string {
  if (containsCyrillic(text)) {
    return text; // Already has Cyrillic
  }
  return latinToCyrillic(text);
}
