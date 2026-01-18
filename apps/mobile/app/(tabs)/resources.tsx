/**
 * Resources Screen
 * 
 * Hub for additional learning resources and tools
 * Mirrors PWA's app/[locale]/resources/page.tsx
 * 
 * @see PARITY_CHECKLIST.md - Feature parity
 * @see app/[locale]/resources/page.tsx (PWA implementation)
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  BookmarkPlus,
  Sparkles,
  BookOpen,
  GraduationCap,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  FileSearch,
  Newspaper,
} from 'lucide-react-native';
import { useTranslations } from '../../lib/i18n';

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  onPress: () => void;
  highlight?: boolean;
  external?: boolean;
};

export default function ResourcesScreen() {
  const t = useTranslations('resources');

  const primaryAction: ResourceItem = {
    id: 'saved-words',
    title: t('savedWords'),
    description: t('savedWordsDesc'),
    icon: BookmarkPlus,
    iconColor: '#ec4899',
    bgColor: 'rgba(236,72,153,0.1)',
    borderColor: 'rgba(236,72,153,0.3)',
    onPress: () => router.push('/saved-words'),
    highlight: true,
  };

  const mainItems: ResourceItem[] = [
    {
      id: 'news',
      title: t('news'),
      description: t('newsDesc'),
      icon: Newspaper,
      iconColor: '#dc2626',
      bgColor: 'rgba(220,38,38,0.1)',
      borderColor: 'rgba(220,38,38,0.3)',
      onPress: () => router.push('/news'),
    },
    {
      id: 'translator',
      title: t('languageLab'),
      description: t('languageLabDesc'),
      icon: FlaskConical,
      iconColor: '#f6d83b',
      bgColor: 'rgba(246,216,59,0.1)',
      borderColor: 'rgba(246,216,59,0.3)',
      onPress: () => router.push('/(tabs)/translate'),
    },
    {
      id: 'analyzer',
      title: t('textAnalyzer'),
      description: t('textAnalyzerDesc'),
      icon: FileSearch,
      iconColor: '#a855f7',
      bgColor: 'rgba(168,85,247,0.1)',
      borderColor: 'rgba(168,85,247,0.3)',
      onPress: () => router.push('/analyzer'),
    },
    {
      id: 'grammar',
      title: t('grammarReference'),
      description: t('grammarReferenceDesc'),
      icon: GraduationCap,
      iconColor: '#3b82f6',
      bgColor: 'rgba(59,130,246,0.1)',
      borderColor: 'rgba(59,130,246,0.3)',
      onPress: () => router.push('/grammar'),
    },
    {
      id: 'reader',
      title: t('readingLibrary'),
      description: t('readingLibraryDesc'),
      icon: BookOpen,
      iconColor: '#22c55e',
      bgColor: 'rgba(34,197,94,0.1)',
      borderColor: 'rgba(34,197,94,0.3)',
      onPress: () => router.push('/(tabs)/reader'),
    },
  ];

  // External resources removed per user request

  const renderItem = (item: ResourceItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.itemCard,
        { backgroundColor: item.bgColor, borderColor: item.borderColor },
        item.highlight && styles.itemCardHighlight,
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
        <item.icon size={24} color={item.iconColor} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
      {item.highlight ? (
        <Sparkles size={20} color={item.iconColor} />
      ) : (
        <ChevronRight size={20} color="rgba(247,248,251,0.4)" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('title')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        {/* Primary Action - Saved Words */}
        <View style={styles.section}>
          {renderItem(primaryAction)}
        </View>

        {/* Main Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('learningTools')}</Text>
          {mainItems.map(renderItem)}
        </View>


        {/* Help Link */}
        <TouchableOpacity
          style={styles.helpLink}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <HelpCircle size={18} color="rgba(247,248,251,0.5)" />
          <Text style={styles.helpText}>{t('needHelp')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f7f8fb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(247,248,251,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemCardHighlight: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: 'rgba(247,248,251,0.6)',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.5)',
  },
});
