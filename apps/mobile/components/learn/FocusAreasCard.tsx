/**
 * FocusAreasCard - Shows weak grammar topics for focused practice (Android)
 * 
 * Displays the user's top 3 weak grammar areas based on
 * their exercise performance history. Provides actionable
 * CTAs to practice specific topics.
 * 
 * UX Principles:
 * - Supportive, not alarming (no red/negative colors)
 * - Clear, actionable suggestions
 * - Only shown when weak topics exist
 * 
 * Parity: Must match PWA FocusAreasCard.tsx
 */

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Target, ArrowRight, Sparkles } from 'lucide-react-native';
import { apiFetch } from '../../lib/api';

export interface WeakTopic {
  topicId: string;
  nameEn: string;
  nameMk: string;
  level: string;
  confidence: {
    score: number;
    level: string;
    suggestion: string;
  };
  totalAttempts: number;
  correctAttempts: number;
}

interface FocusAreasCardProps {
  /** Weak topics to display (max 3) */
  weakTopics?: WeakTopic[];
  /** Whether to fetch from API (if weakTopics not provided) */
  autoFetch?: boolean;
}

/**
 * Get confidence level color
 */
function getConfidenceColor(level: string): string {
  switch (level) {
    case 'weak':
      return '#f59e0b'; // Amber
    case 'developing':
      return '#3b82f6'; // Blue
    default:
      return '#64748b'; // Slate
  }
}

export function FocusAreasCard({
  weakTopics: propWeakTopics,
  autoFetch = true,
}: FocusAreasCardProps) {
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>(propWeakTopics || []);
  const [isLoading, setIsLoading] = useState(autoFetch && !propWeakTopics);
  const [error, setError] = useState<string | null>(null);

  // Fetch weak topics from API if not provided
  useEffect(() => {
    if (propWeakTopics || !autoFetch) return;

    async function fetchWeakTopics() {
      try {
        const data = await apiFetch<{ weakTopics: WeakTopic[] }>('/api/user/weak-topics');
        setWeakTopics(data.weakTopics || []);
      } catch (err) {
        console.error('[FocusAreasCard] Error:', err);
        setError('Unable to load focus areas');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeakTopics();
  }, [propWeakTopics, autoFetch]);

  // Update from props if they change
  useEffect(() => {
    if (propWeakTopics) {
      setWeakTopics(propWeakTopics);
    }
  }, [propWeakTopics]);

  // Don't render if no weak topics
  if (!isLoading && weakTopics.length === 0) {
    return null;
  }

  // Handle practice click
  const handlePracticeClick = (topic: WeakTopic) => {
    // Navigate to practice with topic filter
    router.push(`/practice?topic=${topic.topicId}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Target size={16} color="#f6d83b" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Focus Areas</Text>
          <Text style={styles.subtitle}>Topics that could use some attention</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#f6d83b" />
          </View>
        ) : error ? (
          // Error state
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          // Topic cards
          weakTopics.map((topic) => {
            const color = getConfidenceColor(topic.confidence.level);
            
            return (
              <View key={topic.topicId} style={styles.topicCard}>
                <View style={styles.topicInfo}>
                  {/* Topic name row */}
                  <View style={styles.topicNameRow}>
                    <Text style={styles.topicName} numberOfLines={1}>
                      {topic.nameEn}
                    </Text>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>{topic.level}</Text>
                    </View>
                  </View>
                  
                  {/* Macedonian name */}
                  <Text style={styles.topicNameMk}>{topic.nameMk}</Text>

                  {/* Confidence bar */}
                  <View style={styles.confidenceRow}>
                    <View style={styles.confidenceBarBg}>
                      <View
                        style={[
                          styles.confidenceBarFill,
                          { width: `${topic.confidence.score}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.confidenceText, { color }]}>
                      {topic.confidence.score}%
                    </Text>
                  </View>

                  {/* Suggestion */}
                  <Text style={styles.suggestion} numberOfLines={1}>
                    {topic.confidence.suggestion}
                  </Text>
                </View>

                {/* Practice button */}
                <TouchableOpacity
                  style={styles.practiceButton}
                  onPress={() => handlePracticeClick(topic)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.practiceButtonText}>Practice</Text>
                  <ArrowRight size={12} color="#f7f8fb" />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Encouragement footer */}
        {!isLoading && !error && weakTopics.length > 0 && (
          <View style={styles.footer}>
            <Sparkles size={12} color="rgba(247,248,251,0.5)" />
            <Text style={styles.footerText}>
              A little practice goes a long way!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f18',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.5)',
    textAlign: 'center',
    padding: 16,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7f8fb',
    flex: 1,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    color: 'rgba(247,248,251,0.6)',
    fontWeight: '500',
  },
  topicNameMk: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 2,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  confidenceBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
  suggestion: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
    marginTop: 6,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(246,216,59,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  practiceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
  },
});

export default FocusAreasCard;
