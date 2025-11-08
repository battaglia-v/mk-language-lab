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
