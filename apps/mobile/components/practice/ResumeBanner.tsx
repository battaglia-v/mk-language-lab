/**
 * ResumeBanner - Banner to resume interrupted practice sessions
 * 
 * Shows when there's a saved practice session that can be resumed
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see lib/session-persistence.ts (PWA implementation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Play, X, RotateCcw, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  getSessionResumeInfo,
  clearPracticeSession,
} from '../../lib/practice-session';
import { haptic } from '../../lib/haptics';

type ResumeBannerProps = {
  /** Called when session is resumed or cleared */
  onAction?: () => void;
};

export function ResumeBanner({ onAction }: ResumeBannerProps) {
  const [sessionInfo, setSessionInfo] = useState<{
    hasSession: boolean;
    deckType: string;
    progress: number;
    cardsRemaining: number;
    lastUpdated: string;
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const checkSession = useCallback(async () => {
    const info = await getSessionResumeInfo();
    setSessionInfo(info);
    
    if (info?.hasSession) {
      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [fadeAnim]);

  // Check for resumable session on focus
  useFocusEffect(
    useCallback(() => {
      checkSession();
    }, [checkSession])
  );

  const handleResume = () => {
    haptic.medium();
    router.push({
      pathname: '/practice/session',
      params: { resume: 'true' },
    });
    onAction?.();
  };

  const handleClear = async () => {
    haptic.light();
    
    // Animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      await clearPracticeSession();
      setSessionInfo(null);
      onAction?.();
    });
  };

  if (!sessionInfo?.hasSession) return null;

  // Format time since last updated
  const getTimeAgo = (isoString: string): string => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Get friendly deck name
  const getDeckName = (deckType: string): string => {
    const names: Record<string, string> = {
      curated: 'Vocabulary',
      favorites: 'Saved Words',
      mistakes: 'Mistakes Review',
    };
    return names[deckType] || deckType;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Clear button */}
      <TouchableOpacity
        style={styles.clearButton}
        onPress={handleClear}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={18} color="rgba(247,248,251,0.5)" />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <RotateCcw size={20} color="#3b82f6" />
        </View>
        
        <View style={styles.textContent}>
          <Text style={styles.title}>Continue practicing?</Text>
          <Text style={styles.subtitle}>
            {getDeckName(sessionInfo.deckType)} • {sessionInfo.cardsRemaining} cards left
          </Text>
          <View style={styles.metaRow}>
            <Clock size={12} color="rgba(247,248,251,0.4)" />
            <Text style={styles.metaText}>{getTimeAgo(sessionInfo.lastUpdated)}</Text>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>{sessionInfo.progress}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Resume button */}
      <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
        <Play size={18} color="#f7f8fb" fill="#f7f8fb" />
        <Text style={styles.resumeText}>Resume</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Compact version for use in lists/headers
 */
export function ResumeSessionPill({ onPress }: { onPress: () => void }) {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    getSessionResumeInfo().then((info) => setHasSession(!!info?.hasSession));
  }, []);

  if (!hasSession) return null;

  return (
    <TouchableOpacity style={styles.pill} onPress={onPress}>
      <RotateCcw size={14} color="#3b82f6" />
      <Text style={styles.pillText}>Resume</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    paddingRight: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.7)',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.4)',
  },
  progressPill: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
  },
  resumeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  // Pill styles
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default ResumeBanner;
