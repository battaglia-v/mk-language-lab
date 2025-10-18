'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Search, Sparkles } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import resourcesData from '@/data/resources.json';

type ResourceLink = {
  title: string;
  url: string;
  page: number;
};

type ResourceSection = {
  title: string;
  page: number;
  resources: ResourceLink[];
};

type ResourceFile = {
  source: string;
  generatedAt: string;
  sections: ResourceSection[];
};

type ExtendedSection = ResourceSection & { slug: string };

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const resourceFile = resourcesData as ResourceFile;
  const sections = resourceFile.sections;

  const sectionsWithSlug = useMemo<ExtendedSection[]>(
    () =>
      sections.map((section, index) => ({
        ...section,
        slug: slugify(section.title, `section-${index}`),
      })),
    [sections]
  );

  const sectionParamRaw = searchParams.get('section');
  const validSectionParam = useMemo(() => {
    if (sectionParamRaw && sectionsWithSlug.some((section) => section.slug === sectionParamRaw)) {
      return sectionParamRaw;
    }
    return 'all';
  }, [sectionParamRaw, sectionsWithSlug]);

  const initialQuery = searchParams.get('q') ?? '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeSection, setActiveSection] = useState(validSectionParam);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setActiveSection(validSectionParam);
  }, [validSectionParam]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window === 'undefined') {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery) {
        params.set('q', trimmedQuery);
      } else {
        params.delete('q');
      }

      if (activeSection && activeSection !== 'all') {
        params.set('section', activeSection);
      } else {
        params.delete('section');
      }

      const nextQuery = params.toString();
      const currentQuery = window.location.search.replace(/^\?/, '');

      if (nextQuery !== currentQuery) {
        router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [activeSection, pathname, router, searchQuery]);

  useEffect(() => {
    if (activeSection === 'all') {
      return;
    }

    const element = document.getElementById(`section-${activeSection}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let workingSections = sectionsWithSlug;

    if (activeSection !== 'all') {
      workingSections = workingSections.filter((section) => section.slug === activeSection);
    }

    if (!query) {
      return workingSections;
    }

    return workingSections
      .map((section) => {
        const sectionMatches = section.title.toLowerCase().includes(query);
        const matchingResources = section.resources.filter((resource) => {
          const titleMatches = resource.title.toLowerCase().includes(query);
          const urlMatches = resource.url.toLowerCase().includes(query);
          return titleMatches || urlMatches;
        });

        if (matchingResources.length > 0) {
          return {
            ...section,
            resources: matchingResources,
          } satisfies ExtendedSection;
        }

        return sectionMatches ? section : null;
      })
      .filter((section): section is ExtendedSection => Boolean(section));
  }, [activeSection, searchQuery, sectionsWithSlug]);

  const totalMatches = filteredSections.reduce((acc, section) => acc + section.resources.length, 0);
  const totalResources = sectionsWithSlug.reduce((acc, section) => acc + section.resources.length, 0);
  const pdfUrl = resourceFile.source;
  const generatedDate = new Date(resourceFile.generatedAt);
  const selectedSection = activeSection !== 'all' ? sectionsWithSlug.find((section) => section.slug === activeSection) : null;
  const resultsSummary = t('resultsSummary', { count: totalMatches, total: totalResources });

  const handleSectionSelect = (slug: string) => {
    setActiveSection(slug);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {t('title')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('subtitle')}
            </h1>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('search')}
                className="pl-10 text-lg h-12"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <Button variant="outline" asChild className="gap-2">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  {t('viewPdf')}
                </a>
              </Button>
              <span>
                Updated{' '}
                <span className="italic">
                  {generatedDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
              <span>{resultsSummary}</span>
              {selectedSection && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary">
                  <Sparkles className="h-4 w-4" />
                  {selectedSection.title}
                </span>
              )}
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={activeSection === 'all' ? 'default' : 'outline'}
                  onClick={() => handleSectionSelect('all')}
                >
                  {t('showAll')}
                </Button>
                {sectionsWithSlug.map((section) => (
                  <Button
                    key={section.slug}
                    type="button"
                    size="sm"
                    variant={activeSection === section.slug ? 'default' : 'outline'}
                    onClick={() => handleSectionSelect(section.slug)}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="max-w-6xl mx-auto">
            {filteredSections.length === 0 || totalMatches === 0 ? (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('noResults')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredSections.map((section) => (
                  <Card key={section.slug} id={`section-${section.slug}`} className="bg-card/50 backdrop-blur border-border/50">
                    <CardHeader className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-2xl font-semibold">{section.title}</CardTitle>
                            <CardDescription>Page {section.page}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {section.resources.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.resources.map((resource) => (
                          <Button
                            key={`${section.slug}-${resource.url}`}
                            variant="outline"
                            asChild
                            className="h-auto py-3 px-4 justify-between gap-3"
                          >
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-between gap-3">
                              <span className="flex items-center gap-2 text-left">
                                <ExternalLink className="h-4 w-4" />
                                <span className="truncate" title={resource.title}>
                                  {resource.title}
                                </span>
                              </span>
                              <Badge variant="outline" className="shrink-0">
                                p. {resource.page}
                              </Badge>
                            </a>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* PDF Viewer Info */}
          <Card className="mt-8 bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>{t('searchInDoc')}</CardTitle>
              <CardDescription className="text-base pt-2">
                Click &quot;View PDF&quot; above to open the dictionary. You can use your browser&apos;s built-in PDF viewer to search within the document (Ctrl+F or Cmd+F).
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
            <p>
              Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
            </p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
