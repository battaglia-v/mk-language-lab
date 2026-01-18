/**
 * FeedbackBanner - Mobile alpha feedback banner
 * 
 * Shows at the top of screens to encourage user feedback.
 * Dismissible and persisted to AsyncStorage.
 * 
 * @see components/ui/AlphaBanner.tsx (PWA equivalent)
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageSquare, X, ExternalLink } from 'lucide-react-native';

const STORAGE_KEY = 'mkll:feedback-banner-dismissed';
const FEEDBACK_EMAIL = 'contact@mklanguage.com';

interface FeedbackBannerProps {
  /** Show in compact mode (single line) */
  compact?: boolean;
}

export function FeedbackBanner({ compact = false }: FeedbackBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const checkDismissed = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
        if (dismissed !== 'true') {
          setIsVisible(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      } catch {
        // Default to showing
        setIsVisible(true);
      }
    };
    checkDismissed();
  }, [fadeAnim]);

  const handleDismiss = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      setIsVisible(false);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Ignore storage errors
      }
    });
  };

  const handleSendFeedback = () => {
    const subject = encodeURIComponent('Alpha Feedback - MK Language Lab Mobile');
    const body = encodeURIComponent('\n\n---\nSent from MK Language Lab Mobile App');
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`);
  };

  if (!isVisible) return null;

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.compactContent} onPress={handleSendFeedback}>
          <MessageSquare size={14} color="#ffffff" />
          <Text style={styles.compactText}>Alpha Preview — Feedback welcome!</Text>
          <ExternalLink size={12} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.compactDismiss} onPress={handleDismiss}>
          <X size={14} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MessageSquare size={18} color="#f6d83b" />
          <Text style={styles.title}>Alpha Preview</Text>
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <X size={18} color="rgba(247,248,251,0.5)" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.description}>
          Help us improve! Share your feedback on bugs, features, or suggestions.
        </Text>

        <TouchableOpacity style={styles.feedbackButton} onPress={handleSendFeedback}>
          <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          <ExternalLink size={16} color="#06060b" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: 'rgba(246,216,59,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.3)',
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#f6d83b',
    marginLeft: 8,
  },
  dismissButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.72)',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingVertical: 12,
    borderRadius: 10,
  },
  feedbackButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#06060b',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(246,216,59,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
  },
  compactDismiss: {
    padding: 8,
    marginRight: -8,
  },
});

export default FeedbackBanner;
