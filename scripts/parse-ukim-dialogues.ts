#!/usr/bin/env npx tsx
/**
 * UKIM Dialogue Parser
 * 
 * Extracts structured dialogues from raw UKIM textbook data.
 * The source data has dialogues embedded in theme titles with:
 * - Lines marked with `–` (en-dash)
 * - Fill-in-the-blank markers (`______`)
 * - Optional section labels (А, Б, В, Г)
 * - Speaker names sometimes at end of lines
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface DialogueLine {
  speaker?: string;
  textMk: string;
  hasBlanks: boolean;
  blanksCount: number;
}

interface ParsedDialogue {
  id: string;
  sectionLabel?: string; // А, Б, В, Г
  title?: string;
  lines: DialogueLine[];
  sourceTheme: number;
  sourceChapter: number;
}

interface UKIMTheme {
  themeNumber: number;
  title: string;
  exercises?: string[];
}

interface UKIMChapter {
  chapterNumber?: number;
  chapter?: number;
  title: string;
  themes: UKIMTheme[];
}

interface UKIMData {
  chapters: UKIMChapter[];
}

// Known speaker names from the UKIM textbook
const KNOWN_SPEAKERS = [
  'Влатко', 'Ема', 'Андреј', 'Весна', 'Томислав', 'Марија', 'Ваљбона',
  'Марко', 'Даниел', 'Петар', 'Тамара', 'Ивана', 'Ѓорѓи', 'Маја',
  'Ана', 'Лена', 'Дарко'
];

// Section labels (Cyrillic)
const SECTION_LABELS = ['А', 'Б', 'В', 'Г', 'Д', 'Ѓ', 'Е', 'Ж', 'З'];

/**
 * Check if text contains dialogue markers
 */
function hasDialogueMarkers(text: string): boolean {
  // Look for en-dash or em-dash followed by text (dialogue pattern)
  return /[–—]\s+[А-Яа-яЀ-ӿ]/.test(text);
}

/**
 * Count blanks in a line
 */
function countBlanks(text: string): number {
  const matches = text.match(/_+/g);
  return matches ? matches.length : 0;
}

/**
 * Try to extract speaker name from line
 */
function extractSpeaker(line: string): { speaker?: string; text: string } {
  // Check if line ends with a known speaker name
  for (const speaker of KNOWN_SPEAKERS) {
    // Pattern: "Јас сум Влатко" or ends with speaker name
    if (line.includes(`сум ${speaker}`) || line.includes(`Јас сум ${speaker}`)) {
      return { speaker, text: line };
    }
  }
  
  // Check for speaker at start: "Влатко: ..."
  const colonMatch = line.match(/^([А-Яа-яЀ-ӿ]+):\s*(.+)/);
  if (colonMatch && KNOWN_SPEAKERS.includes(colonMatch[1])) {
    return { speaker: colonMatch[1], text: colonMatch[2] };
  }
  
  return { text: line };
}

/**
 * Parse raw theme text into dialogues
 */
function parseThemeDialogues(
  themeText: string,
  themeNumber: number,
  chapterNumber: number
): ParsedDialogue[] {
  const dialogues: ParsedDialogue[] = [];
  
  if (!hasDialogueMarkers(themeText)) {
    return dialogues;
  }
  
  // Split by section labels (А, Б, В, Г) if present
  const sectionPattern = /\s+([АБВГДЃЕЖЗ])\s+[–—]/;
  const sections = themeText.split(sectionPattern);
  
  let currentSectionLabel: string | undefined;
  let dialogueIndex = 0;
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    
    // Check if this is a section label
    if (SECTION_LABELS.includes(section)) {
      currentSectionLabel = section;
      continue;
    }
    
    // Extract dialogue lines from section
    const lines = extractDialogueLines(section);
    
    if (lines.length >= 2) {
      dialogues.push({
        id: `ukim-c${chapterNumber}-t${themeNumber}-d${dialogueIndex}`,
        sectionLabel: currentSectionLabel,
        lines,
        sourceTheme: themeNumber,
        sourceChapter: chapterNumber,
      });
      dialogueIndex++;
      currentSectionLabel = undefined;
    }
  }
  
  // If no sections found, try parsing the whole text
  if (dialogues.length === 0) {
    const lines = extractDialogueLines(themeText);
    if (lines.length >= 2) {
      dialogues.push({
        id: `ukim-c${chapterNumber}-t${themeNumber}-d0`,
        lines,
        sourceTheme: themeNumber,
        sourceChapter: chapterNumber,
      });
    }
  }
  
  return dialogues;
}

/**
 * Extract dialogue lines from text
 */
function extractDialogueLines(text: string): DialogueLine[] {
  const lines: DialogueLine[] = [];
  
  // Split by dialogue markers (en-dash or em-dash)
  // Pattern: start of text or whitespace, then dash, then content
  const parts = text.split(/\s+[–—]\s+/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    
    // Skip empty or very short parts
    if (trimmed.length < 3) continue;
    
    // Skip parts that look like exercise instructions
    if (/^Вежба\s+\d/i.test(trimmed)) continue;
    if (/^слушање/i.test(trimmed)) continue;
    if (/^Слушај/i.test(trimmed)) continue;
    if (/^Читај/i.test(trimmed)) continue;
    if (/^Напиши/i.test(trimmed)) continue;
    
    // Skip parts that are just vocabulary lists
    if (/^[а-яА-Я]+\s+•/.test(trimmed)) continue;
    
    // Check if this looks like dialogue (Cyrillic text, possibly with blanks)
    if (!/[А-Яа-яЀ-ӿ]/.test(trimmed)) continue;
    
    // Extract speaker if present
    const { speaker, text: lineText } = extractSpeaker(trimmed);
    
    // Clean up the line
    let cleanedText = lineText
      .replace(/\s+/g, ' ')
      .replace(/^\s*[–—]\s*/, '')
      // Remove trailing vocabulary lists (•)
      .replace(/\s+[А-Яа-яЀ-ӿ]+\s+•.*$/, '')
      // Remove section markers at end
      .replace(/\s+[АБВГДЃЕЖЗ]\s*$/, '')
      // Remove exercise references
      .replace(/\s*\(слушање.*?\)/gi, '')
      .replace(/\s*\(Слушање.*?\)/gi, '')
      .trim();
    
    // Skip if line is now too short or just punctuation
    if (cleanedText.length < 3 || !/[А-Яа-яЀ-ӿ]/.test(cleanedText)) continue;
    
    lines.push({
      speaker,
      textMk: cleanedText,
      hasBlanks: countBlanks(cleanedText) > 0,
      blanksCount: countBlanks(cleanedText),
    });
  }
  
  return lines;
}

/**
 * Assign alternating speakers to dialogue lines
 */
function assignSpeakers(dialogue: ParsedDialogue, speakerPair: [string, string] = ['A', 'B']): void {
  let currentSpeaker = 0;
  
  for (const line of dialogue.lines) {
    if (!line.speaker) {
      line.speaker = speakerPair[currentSpeaker % 2];
    }
    currentSpeaker++;
  }
}

/**
 * Main parser function
 */
async function parseUKIMDialogues(): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data/curriculum/structured');
  const outputDir = path.join(process.cwd(), 'data/dialogues');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const allDialogues: ParsedDialogue[] = [];
  // Include all curriculum files that might have dialogues
  const files = [
    'a1-teskoto-curated.json',
    'a1-teskoto.json',
    'a2-lozje.backup.json',
    'b1-zlatovrv.backup.json',
  ];
  
  for (const filename of files) {
    const filepath = path.join(dataDir, filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} - file not found`);
      continue;
    }
    
    console.log(`\nParsing ${filename}...`);
    
    const rawData = fs.readFileSync(filepath, 'utf-8');
    const data: UKIMData = JSON.parse(rawData);
    
    for (const chapter of data.chapters) {
      const chapterNum = chapter.chapterNumber ?? chapter.chapter ?? 0;
      for (const theme of chapter.themes) {
        const dialogues = parseThemeDialogues(
          theme.title,
          theme.themeNumber,
          chapterNum
        );
        
        for (const dialogue of dialogues) {
          // Assign default speakers if none detected
          const detectedSpeakers = dialogue.lines
            .filter(l => l.speaker && KNOWN_SPEAKERS.includes(l.speaker))
            .map(l => l.speaker!);
          
          if (detectedSpeakers.length >= 2) {
            assignSpeakers(dialogue, [detectedSpeakers[0], detectedSpeakers[1]]);
          } else {
            assignSpeakers(dialogue);
          }
          
          allDialogues.push(dialogue);
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DIALOGUE PARSING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total dialogues found: ${allDialogues.length}`);
  
  const withBlanks = allDialogues.filter(d => d.lines.some(l => l.hasBlanks));
  console.log(`Dialogues with fill-in-blanks: ${withBlanks.length}`);
  
  const totalLines = allDialogues.reduce((sum, d) => sum + d.lines.length, 0);
  console.log(`Total dialogue lines: ${totalLines}`);
  
  // Output dialogues
  const outputPath = path.join(outputDir, 'ukim-dialogues.json');
  fs.writeFileSync(outputPath, JSON.stringify(allDialogues, null, 2), 'utf-8');
  console.log(`\nSaved to: ${outputPath}`);
  
  // Print sample dialogues
  console.log('\n' + '='.repeat(60));
  console.log('SAMPLE DIALOGUES');
  console.log('='.repeat(60));
  
  for (const dialogue of allDialogues.slice(0, 3)) {
    console.log(`\n[${dialogue.id}]${dialogue.sectionLabel ? ` Section ${dialogue.sectionLabel}` : ''}`);
    console.log(`Source: Chapter ${dialogue.sourceChapter}, Theme ${dialogue.sourceTheme}`);
    console.log('Lines:');
    for (const line of dialogue.lines) {
      const blanksNote = line.hasBlanks ? ` [${line.blanksCount} blanks]` : '';
      console.log(`  ${line.speaker || '?'}: ${line.textMk}${blanksNote}`);
    }
  }
  
  return;
}

// Run the parser
parseUKIMDialogues()
  .then(() => console.log('\nDone!'))
  .catch(console.error);
