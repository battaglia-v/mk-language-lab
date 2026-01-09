'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import {
  BookmarkPlus,
  Languages,
  BookText,
  BookOpen,
  Play,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { readFavorites, removeFavorite, clearFavorites, type FavoriteItem } from '@/lib/favorites';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';

type WordSource = 'all' | 'translate' | 'reader';

export default function SavedWordsPage() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const { status } = useSession();
  
  // Saved phrases from translator
  const { phrases, deletePhrase, clearAll: clearAllPhrases } = useSavedPhrases();
  
  // Favorites from reader
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<WordSource>('all');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  
  // Load favorites on mount
  useEffect(() => {
    setFavorites(readFavorites());
  }, []);
  
  // Combine all saved words
  const allWords = useMemo(() => {
    const words: Array<{
      id: string;
      macedonian: string;
      english: string;
      source: 'translate' | 'reader';
      savedAt: string;
    }> = [];
    
    // Add translator phrases
    phrases.forEach((phrase) => {
      words.push({
        id: phrase.id,
        macedonian: phrase.directionId === 'en-mk' ? phrase.translatedText : phrase.sourceText,
        english: phrase.directionId === 'en-mk' ? phrase.sourceText : phrase.translatedText,
        source: 'translate',
        savedAt: phrase.createdAt,
      });
    });
    
    // Add reader favorites
    favorites.forEach((fav) => {
      words.push({
        id: fav.id,
        macedonian: fav.macedonian,
        english: fav.english,
        source: 'reader',
        savedAt: fav.favoritedAt,
      });
    });
    
    // Sort by saved date (newest first)
    return words.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }, [phrases, favorites]);
  
  // Filter words
  const filteredWords = useMemo(() => {
    return allWords.filter((word) => {
      // Filter out deleted words
      if (deletedIds.has(word.id)) return false;
      
      // Source filter
      if (sourceFilter !== 'all' && word.source !== sourceFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          word.macedonian.toLowerCase().includes(query) ||
          word.english.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [allWords, sourceFilter, searchQuery, deletedIds]);
  
  // Counts by source
  const counts = useMemo(() => ({
    translate: phrases.length,
    reader: favorites.length,
    total: allWords.length - deletedIds.size,
  }), [phrases.length, favorites.length, allWords.length, deletedIds.size]);
  
  const handleDeleteWord = (word: typeof allWords[0]) => {
    setDeletedIds((prev) => new Set(prev).add(word.id));
    
    if (word.source === 'translate') {
      deletePhrase(word.id);
    } else {
      removeFavorite(word.id);
      setFavorites((prev) => prev.filter((f) => f.id !== word.id));
    }
  };
  
  const handleClearAll = () => {
    clearAllPhrases();
    clearFavorites();
    setFavorites([]);
    setDeletedIds(new Set());
  };
  
  
  return (
    <PageContainer size="lg" className="pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${locale}/practice`}>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookmarkPlus className="h-6 w-6 text-pink-500" />
            My Saved Words
          </h1>
          <p className="text-sm text-muted-foreground">
            {counts.total} words saved
          </p>
        </div>
        {counts.total > 0 && (
          <Link href={`/${locale}/practice/session?deck=saved&mode=multiple-choice`}>
            <Button className="gap-2 bg-pink-500 hover:bg-pink-600">
              <Play className="h-4 w-4" />
              Practice All
            </Button>
          </Link>
        )}
      </div>
      
      {counts.total === 0 ? (
        /* Empty state with step-by-step instructions */
        <Card className="p-6 sm:p-8 border-dashed border-2 border-border/50">
          <div className="text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
              <BookmarkPlus className="h-10 w-10 text-pink-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start building your word bank</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Save words you want to remember and they&apos;ll appear here for easy review and practice.
            </p>
          </div>
          
          {/* Step-by-step instructions */}
          <div className="space-y-4 max-w-lg mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
              3 ways to save words
            </p>
            
            {/* Method 1: Translate */}
            <div className="flex gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <Languages className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Translate</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Translate any word or phrase, then tap the <span className="inline-flex items-center gap-1 text-pink-500 font-medium">♡ heart</span> icon to save it to your deck.
                </p>
                <Link href={`/${locale}/translate`} className="inline-block mt-2">
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-blue-600 border-blue-500/30 hover:bg-blue-500/10">
                    Open Translate
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Method 2: Reader */}
            <div className="flex gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                <BookText className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Reader</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  While reading, tap any word to see its meaning. Then tap <span className="font-medium">&ldquo;Save word&rdquo;</span> to add it to your deck.
                </p>
                <Link href={`/${locale}/reader`} className="inline-block mt-2">
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-green-600 border-green-500/30 hover:bg-green-500/10">
                    Open Reader
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Method 3: Lessons */}
            <div className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Lessons</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Complete lessons and the vocabulary will automatically be added to your <span className="font-medium">Lesson Review</span> practice deck.
                </p>
                <Link href={`/${locale}/learn`} className="inline-block mt-2">
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-primary border-primary/30 hover:bg-primary/10">
                    Start Learning
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sourceFilter === 'all' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('all')}
                className="gap-1.5"
              >
                <Filter className="h-3.5 w-3.5" />
                All ({counts.total})
              </Button>
              <Button
                variant={sourceFilter === 'translate' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('translate')}
                className="gap-1.5"
              >
                <Languages className="h-3.5 w-3.5" />
                Translate ({counts.translate})
              </Button>
              <Button
                variant={sourceFilter === 'reader' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSourceFilter('reader')}
                className="gap-1.5"
              >
                <BookText className="h-3.5 w-3.5" />
                Reader ({counts.reader})
              </Button>
            </div>
          </div>
          
          {/* Word List */}
          <div className="space-y-2">
            {filteredWords.map((word) => (
              <Card
                key={word.id}
                className={cn(
                  'p-4 flex items-center gap-4 transition-all',
                  'hover:border-primary/30 hover:bg-accent/30'
                )}
              >
                {/* Source indicator */}
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                  word.source === 'translate' ? 'bg-blue-500/10' : 'bg-green-500/10'
                )}>
                  {word.source === 'translate' ? (
                    <Languages className="h-5 w-5 text-blue-500" />
                  ) : (
                    <BookText className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                {/* Word content */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {word.macedonian}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {word.english}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteWord(word)}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            
            {filteredWords.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No words match &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
          
          {/* Clear All */}
          {counts.total > 0 && (
            <div className="mt-6 pt-6 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Saved Words
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all saved words?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {counts.total} saved words from both
                      Translate and Reader. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}

