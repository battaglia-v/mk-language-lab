/**
 * Share Functionality for React Native
 * 
 * Enables sharing translations, reader content, and other data
 * Uses native share sheet on iOS and Android
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 */

import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export type ShareContent = {
  title?: string;
  message: string;
  url?: string;
};

/**
 * Share content using native share sheet
 */
export async function shareContent(content: ShareContent): Promise<boolean> {
  try {
    const result = await Share.share(
      {
        title: content.title,
        message: content.message,
        url: content.url,
      },
      {
        dialogTitle: content.title || 'Share',
        subject: content.title, // For email sharing
      }
    );

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with specific activity type
        console.log('[Share] Shared via:', result.activityType);
      }
      return true;
    } else if (result.action === Share.dismissedAction) {
      // User dismissed share sheet
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('[Share] Failed to share:', error);
    return false;
  }
}

/**
 * Share a translation
 */
export async function shareTranslation(data: {
  sourceText: string;
  translatedText: string;
  direction: 'mk-to-en' | 'en-to-mk';
}): Promise<boolean> {
  const { sourceText, translatedText, direction } = data;
  
  const directionLabel = direction === 'mk-to-en' 
    ? '🇲🇰 → 🇬🇧' 
    : '🇬🇧 → 🇲🇰';
  
  const message = `${directionLabel}\n\n${sourceText}\n\n${translatedText}\n\n— MK Language Lab`;
  
  return shareContent({
    title: 'Translation',
    message,
  });
}

/**
 * Share a reader story
 */
export async function shareStory(data: {
  title: string;
  excerpt?: string;
  level: string;
}): Promise<boolean> {
  const { title, excerpt, level } = data;
  
  let message = `📖 ${title} (${level})\n\n`;
  if (excerpt) {
    message += `"${excerpt.slice(0, 100)}${excerpt.length > 100 ? '...' : ''}"\n\n`;
  }
  message += '— MK Language Lab';
  
  return shareContent({
    title: `Read: ${title}`,
    message,
  });
}

/**
 * Share a vocabulary word
 */
export async function shareWord(data: {
  macedonian: string;
  english: string;
  category?: string;
}): Promise<boolean> {
  const { macedonian, english, category } = data;
  
  let message = `🇲🇰 ${macedonian}\n🇬🇧 ${english}`;
  if (category) {
    message += `\n\n📚 ${category}`;
  }
  message += '\n\n— MK Language Lab';
  
  return shareContent({
    title: 'Vocabulary',
    message,
  });
}

/**
 * Share practice results
 */
export async function sharePracticeResults(data: {
  mode: string;
  correct: number;
  total: number;
  accuracy: number;
  xpEarned: number;
}): Promise<boolean> {
  const { mode, correct, total, accuracy, xpEarned } = data;
  
  const emoji = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '⭐' : '💪';
  
  const message = `${emoji} Practice Complete!\n\n` +
    `📊 ${mode}\n` +
    `✅ ${correct}/${total} correct (${accuracy}%)\n` +
    `⚡ +${xpEarned} XP\n\n` +
    '— MK Language Lab';
  
  return shareContent({
    title: 'Practice Results',
    message,
  });
}

/**
 * Share streak achievement
 */
export async function shareStreak(streakDays: number): Promise<boolean> {
  const milestones = [7, 14, 30, 60, 100, 365];
  const isMilestone = milestones.includes(streakDays);
  
  const emoji = isMilestone ? '🎉' : '🔥';
  
  const message = `${emoji} ${streakDays}-day streak!\n\n` +
    `I've been learning Macedonian for ${streakDays} days in a row!\n\n` +
    '— MK Language Lab';
  
  return shareContent({
    title: 'Learning Streak',
    message,
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('[Share] Failed to copy:', error);
    return false;
  }
}

/**
 * Copy translation to clipboard
 */
export async function copyTranslation(data: {
  sourceText: string;
  translatedText: string;
}): Promise<boolean> {
  const text = `${data.sourceText}\n${data.translatedText}`;
  return copyToClipboard(text);
}

/**
 * Check if share is available
 */
export function isShareAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
