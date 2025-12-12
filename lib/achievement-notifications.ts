import prisma from '@/lib/prisma';
import { sendExpoPushNotifications, type ExpoPushMessage } from '@/lib/expo-push';

export interface AchievementNotification {
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  category: 'achievement' | 'cosmetic' | 'seasonal';
  rarityTier: 'common' | 'rare' | 'epic' | 'legendary';
}

const RARITY_EMOJIS: Record<string, string> = {
  common: '🏅',
  rare: '🥈',
  epic: '🏆',
  legendary: '⭐',
};

/**
 * Send push notification when a user unlocks an achievement/badge
 */
export async function sendAchievementNotification(
  notification: AchievementNotification
): Promise<{ sent: boolean; tokensUsed: number }> {
  try {
    // Get user's active push tokens
    const tokens = await prisma.mobilePushToken.findMany({
      where: {
        userId: notification.userId,
        revokedAt: null,
      },
      select: {
        expoPushToken: true,
      },
    });

    if (tokens.length === 0) {
      console.log('[achievement-notifications] No push tokens for user', {
        userId: notification.userId,
      });
      return { sent: false, tokensUsed: 0 };
    }

    const emoji = RARITY_EMOJIS[notification.rarityTier] || '🏅';
    const title = `${emoji} Achievement Unlocked!`;
    const body = `You earned "${notification.badgeName}"! ${notification.badgeDescription}`;

    type TokenResult = (typeof tokens)[number];
    const messages: ExpoPushMessage[] = tokens.map((token: TokenResult) => ({
      to: token.expoPushToken,
      sound: 'default',
      title,
      body,
      data: {
        type: 'achievement_unlocked',
        badgeId: notification.badgeId,
        category: notification.category,
        rarityTier: notification.rarityTier,
      },
      priority: 'high',
    }));

    const results = await sendExpoPushNotifications(messages);
    const successCount = results.filter((r) => r.ticket.status === 'ok').length;

    console.log('[achievement-notifications] Sent notifications', {
      userId: notification.userId,
      badgeId: notification.badgeId,
      tokensUsed: tokens.length,
      successCount,
    });

    // Also create an in-app notification
    await prisma.notification.create({
      data: {
        userId: notification.userId,
        type: 'achievement',
        title,
        body,
        actionUrl: `/profile/badges?highlight=${notification.badgeId}`,
        isRead: false,
      },
    });

    return { sent: successCount > 0, tokensUsed: tokens.length };
  } catch (error) {
    console.error('[achievement-notifications] Error sending notification', {
      userId: notification.userId,
      badgeId: notification.badgeId,
      error,
    });
    return { sent: false, tokensUsed: 0 };
  }
}

/**
 * Send batch notifications for multiple achievements (e.g., after level up)
 */
export async function sendBatchAchievementNotifications(
  notifications: AchievementNotification[]
): Promise<{ totalSent: number; totalFailed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  for (const notification of notifications) {
    const result = await sendAchievementNotification(notification);
    if (result.sent) {
      totalSent++;
    } else {
      totalFailed++;
    }
  }

  return { totalSent, totalFailed };
}

/**
 * Check and notify for newly unlocked badges
 * Call this after any action that might unlock badges
 */
export async function checkAndNotifyNewBadges(
  userId: string,
  previousBadgeIds: string[]
): Promise<string[]> {
  const currentBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: {
      badgeId: true,
      badge: {
        select: {
          name: true,
          description: true,
          category: true,
          rarityTier: true,
        },
      },
    },
  });

  const previousSet = new Set(previousBadgeIds);
  type BadgeWithDetails = (typeof currentBadges)[number];
  const newBadges = currentBadges.filter(
    (b: BadgeWithDetails) => !previousSet.has(b.badgeId)
  );
  const notifiedBadgeIds: string[] = [];

  for (const badge of newBadges) {
    await sendAchievementNotification({
      userId,
      badgeId: badge.badgeId,
      badgeName: badge.badge.name,
      badgeDescription: badge.badge.description,
      category: badge.badge.category as 'achievement' | 'cosmetic' | 'seasonal',
      rarityTier: badge.badge.rarityTier as
        | 'common'
        | 'rare'
        | 'epic'
        | 'legendary',
    });
    notifiedBadgeIds.push(badge.badgeId);
  }

  return notifiedBadgeIds;
}
