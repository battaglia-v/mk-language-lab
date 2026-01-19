/**
 * Help & FAQ Screen
 * 
 * Provides user guidance, FAQs, and support options
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  Sparkles,
  Target,
  MessageCircle,
  Mail,
  ExternalLink,
  Volume2,
  Bookmark,
  Trophy,
} from 'lucide-react-native';
import { haptic } from '../lib/haptics';

type FAQItem = {
  question: string;
  answer: string;
  icon: typeof HelpCircle;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I start learning Macedonian?',
    answer: 'Go to the Learn tab and select your level (A1 for beginners). Tap on any lesson to start. Each lesson includes dialogue, vocabulary, grammar notes, and practice exercises.',
    icon: BookOpen,
  },
  {
    question: 'What do the levels A1, A2, B1 mean?',
    answer: 'These are CEFR levels. A1 is beginner, A2 is elementary, and B1 is intermediate. Start with A1 if you\'re new to Macedonian, or take a placement test to find your level.',
    icon: Target,
  },
  {
    question: 'How does the 30-Day Challenge work?',
    answer: 'The 30-Day Reading Challenge provides daily Macedonian stories from "The Little Prince". Complete one story per day to build your reading habit and improve comprehension.',
    icon: Sparkles,
  },
  {
    question: 'How do I practice vocabulary?',
    answer: 'Go to the Practice tab. You can review lesson vocabulary, do word sprints, or practice saved words. The app uses spaced repetition to help you remember words long-term.',
    icon: Trophy,
  },
  {
    question: 'How do I save words for later?',
    answer: 'While reading, tap on any word to see its translation. Press the "Save" button to add it to your saved words list. Practice them from the Practice tab.',
    icon: Bookmark,
  },
  {
    question: 'Can I listen to pronunciation?',
    answer: 'Yes! Tap the speaker icon next to words and sentences to hear native pronunciation. This is available in lessons, the reader, and word lookups.',
    icon: Volume2,
  },
  {
    question: 'How is my progress tracked?',
    answer: 'Your XP, streak, completed lessons, and practice sessions are all tracked. View your stats in your Profile. Complete daily goals to maintain your streak!',
    icon: Target,
  },
  {
    question: 'Can I use the app offline?',
    answer: 'Most lesson content and practice vocabulary are available offline after initial loading. Some features like translation and audio may require an internet connection.',
    icon: HelpCircle,
  },
];

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleBack = () => {
    haptic.light();
    router.back();
  };

  const toggleFAQ = (index: number) => {
    haptic.selection();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContact = () => {
    haptic.light();
    Linking.openURL('mailto:support@mklanguage.app?subject=App%20Support');
  };

  const handleWebsite = () => {
    haptic.light();
    Linking.openURL('https://mklanguage.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <HelpCircle size={40} color="#f6d83b" />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions about learning Macedonian with our app.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleContact}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <Mail size={24} color="#3b82f6" />
            </View>
            <Text style={styles.quickActionTitle}>Contact Support</Text>
            <Text style={styles.quickActionDesc}>Get help from our team</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={handleWebsite}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(168,85,247,0.15)' }]}>
              <ExternalLink size={24} color="#a855f7" />
            </View>
            <Text style={styles.quickActionTitle}>Visit Website</Text>
            <Text style={styles.quickActionDesc}>More resources online</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {FAQ_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedIndex === index;

            return (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqIconContainer}>
                    <Icon size={20} color="#f6d83b" />
                  </View>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={20} color="rgba(247,248,251,0.5)" />
                  ) : (
                    <ChevronDown size={20} color="rgba(247,248,251,0.5)" />
                  )}
                </View>
                
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Still have questions? We&apos;re here to help!
          </Text>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleContact}
            activeOpacity={0.8}
          >
            <MessageCircle size={18} color="#06060b" />
            <Text style={styles.footerButtonText}>Send us a message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222536',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(247,248,251,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(246,216,59,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  faqSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#0b0b12',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222536',
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqItemExpanded: {
    borderColor: 'rgba(246,216,59,0.3)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(246,216,59,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#f7f8fb',
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.7)',
    lineHeight: 21,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#222536',
  },
  footerText: {
    fontSize: 15,
    color: 'rgba(247,248,251,0.6)',
    marginBottom: 16,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f6d83b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06060b',
  },
});
