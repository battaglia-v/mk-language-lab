'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Search } from 'lucide-react';
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

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const [searchQuery, setSearchQuery] = useState('');

  const resourceFile = resourcesData as ResourceFile;
  const sections = resourceFile.sections;

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sections;
    }

    return sections
      .map((section) => {
        const sectionMatches = section.title.toLowerCase().includes(query);
        const matchingResources = section.resources.filter((resource) => {
          const titleMatches = resource.title.toLowerCase().includes(query);
          const urlMatches = resource.url.toLowerCase().includes(query);
          return titleMatches || urlMatches;
        });

        if (sectionMatches && matchingResources.length === 0) {
          return section;
        }

        if (matchingResources.length > 0) {
          return {
            ...section,
            resources: matchingResources,
          } satisfies ResourceSection;
        }

        return sectionMatches ? section : null;
      })
      .filter((section): section is ResourceSection => Boolean(section && section.resources.length > 0));
  }, [sections, searchQuery]);

  const totalMatches = filteredSections.reduce((acc, section) => acc + section.resources.length, 0);
  const pdfUrl = resourceFile.source;
  const generatedDate = new Date(resourceFile.generatedAt);
  const resourceCountLabel = totalMatches === 1 ? 'resource' : 'resources';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">{t('subtitle')}</p>

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

            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
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
              <span>
                {totalMatches} {resourceCountLabel}
              </span>
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
                  <Card key={section.title} className="bg-card/50 backdrop-blur border-border/50">
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
                            key={`${section.title}-${resource.url}`}
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
