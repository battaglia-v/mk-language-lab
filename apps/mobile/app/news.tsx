/**
 * News Screen - Macedonian news aggregator
 * 
 * Features:
 * - Multiple news sources (Time.mk, Meta.mk, Makfax, A1on)
 * - Search and filter functionality
 * - Video-only filter
 * - Tap to read article
 * - Analyze text feature
 * - Reader mode for articles
 * 
 * @see app/[locale]/news/NewsClient.tsx (PWA implementation)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  ExternalLink,
  Video,
  Clock,
  Newspaper,
  FileSearch,
  BookOpen,
  X,
} from 'lucide-react-native';
import {
  fetchNews,
  NewsItem,
  NewsMeta,
  NewsSource,
  getSourceInfo,
  formatRelativeTime,
  stripHtml,
} from '../lib/news';
import { haptic } from '../lib/haptics';
import { useTranslations } from '../lib/i18n';

const SOURCES: { id: NewsSource; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'time-mk', label: 'Time.mk' },
  { id: 'meta-mk', label: 'Meta.mk' },
  { id: 'makfax', label: 'Makfax' },
  { id: 'a1on', label: 'A1on' },
];

export default function NewsScreen() {
  const t = useTranslations('news');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [meta, setMeta] = useState<NewsMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [source, setSource] = useState<NewsSource>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [videosOnly, setVideosOnly] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const loadNews = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetchNews({
        source,
        query: debouncedQuery,
        videosOnly,
        limit: 30,
      });
      
      setItems(response.items);
      setMeta(response.meta);
      
      if (response.meta.errors?.length) {
        console.warn('[News] API errors:', response.meta.errors);
      }
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error('[News] Load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [source, debouncedQuery, videosOnly]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleRefresh = () => {
    haptic.light();
    loadNews(true);
  };

  const handleSourceChange = (newSource: NewsSource) => {
    haptic.selection();
    setSource(newSource);
  };

  const handleOpenArticle = (item: NewsItem) => {
    haptic.light();
    Linking.openURL(item.link);
  };

  const handleAnalyzeArticle = (item: NewsItem) => {
    haptic.selection();
    // Navigate to analyzer with pre-filled text
    const textToAnalyze = `${item.title}\n\n${stripHtml(item.description)}`;
    router.push({
      pathname: '/analyzer',
      params: { text: textToAnalyze, source: 'news' },
    });
  };

  const handleReadArticle = (item: NewsItem) => {
    haptic.selection();
    // Navigate to news reader mode
    router.push({
      pathname: '/news-reader',
      params: { 
        id: item.id,
        title: item.title,
        description: item.description,
        source: item.sourceName,
        link: item.link,
      },
    });
  };

  const renderNewsCard = (item: NewsItem) => {
    const sourceInfo = getSourceInfo(item.sourceId);
    const hasVideo = item.videos.length > 0;
    const description = stripHtml(item.description);

    return (
      <View key={item.id} style={styles.card}>
        {/* Image */}
        {item.imageProxy && (
          <Image
            source={{ uri: item.imageProxy }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Source & Time */}
          <View style={styles.cardMeta}>
            <View style={[styles.sourceBadge, { backgroundColor: `${sourceInfo.color}20` }]}>
              <Text style={[styles.sourceText, { color: sourceInfo.color }]}>
                {sourceInfo.name}
              </Text>
            </View>
            {hasVideo && (
              <View style={styles.videoBadge}>
                <Video size={12} color="#a855f7" />
                <Text style={styles.videoText}>Video</Text>
              </View>
            )}
            <View style={styles.timeContainer}>
              <Clock size={12} color="rgba(247,248,251,0.5)" />
              <Text style={styles.timeText}>{formatRelativeTime(item.publishedAt)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={3}>
            {item.title}
          </Text>

          {/* Description */}
          {description && (
            <Text style={styles.cardDescription} numberOfLines={3}>
              {description}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReadArticle(item)}
            >
              <BookOpen size={16} color="#22c55e" />
              <Text style={[styles.actionText, { color: '#22c55e' }]}>{t('read')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAnalyzeArticle(item)}
            >
              <FileSearch size={16} color="#a855f7" />
              <Text style={[styles.actionText, { color: '#a855f7' }]}>{t('analyze')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOpenArticle(item)}
            >
              <ExternalLink size={16} color="#3b82f6" />
              <Text style={[styles.actionText, { color: '#3b82f6' }]}>{t('open')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#f7f8fb" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Newspaper size={20} color="#f6d83b" />
          <Text style={styles.headerTitle}>{t('title')}</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={20} color="#f7f8fb" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color="rgba(247,248,251,0.5)" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor="rgba(247,248,251,0.4)"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <X size={18} color="rgba(247,248,251,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Source Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {SOURCES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.filterChip,
              source === s.id && styles.filterChipActive,
            ]}
            onPress={() => handleSourceChange(s.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                source === s.id && styles.filterChipTextActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* Video Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            styles.filterChipVideo,
            videosOnly && styles.filterChipVideoActive,
          ]}
          onPress={() => {
            haptic.selection();
            setVideosOnly(!videosOnly);
          }}
        >
          <Video size={14} color={videosOnly ? '#a855f7' : 'rgba(247,248,251,0.6)'} />
          <Text
            style={[
              styles.filterChipText,
              videosOnly && styles.filterChipTextVideo,
            ]}
          >
            Videos
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Meta Info */}
      {meta && !isLoading && (
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {meta.count} articles
            {meta.fetchedAt && ` • Updated ${formatRelativeTime(meta.fetchedAt)}`}
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#f6d83b"
          />
        }
      >
        {isLoading && items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f6d83b" />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadNews()}>
              <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Newspaper size={48} color="rgba(247,248,251,0.3)" />
            <Text style={styles.emptyTitle}>{t('noArticles')}</Text>
            <Text style={styles.emptyText}>
              {t('noArticlesHint')}
            </Text>
          </View>
        ) : (
          items.map(renderNewsCard)
        )}
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
    borderBottomColor: '#1a1a2e',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f7f8fb',
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0b12',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222536',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#f7f8fb',
  },
  filtersContainer: {
    maxHeight: 50,
    marginTop: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(247,248,251,0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(246,216,59,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(246,216,59,0.4)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(247,248,251,0.6)',
  },
  filterChipTextActive: {
    color: '#f6d83b',
  },
  filterChipVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChipVideoActive: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  filterChipTextVideo: {
    color: '#a855f7',
  },
  metaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(247,248,251,0.5)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#0b0b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222536',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#1a1a2e',
  },
  cardContent: {
    padding: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(168,85,247,0.15)',
  },
  videoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a855f7',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(247,248,251,0.5)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f7f8fb',
    lineHeight: 22,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247,248,251,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(247,248,251,0.05)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 14,
    color: '#ff7878',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f6d83b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06060b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f7f8fb',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(247,248,251,0.6)',
    textAlign: 'center',
  },
});
