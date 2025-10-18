'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, ExternalLink, Search } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const [searchQuery, setSearchQuery] = useState('');

  const pdfUrl = process.env.NEXT_PUBLIC_DICTIONARY_PDF_URL || 
    'https://ofs-cdn.italki.com/u/11847001/message/d30vg2pjlt9bmtu5ki9g.pdf';

  const resources = [
    {
      title: t('dictionary'),
      description: t('dictionaryDesc'),
      type: 'PDF',
      url: pdfUrl,
    },
  ];

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="pl-10 text-lg h-12"
              />
            </div>
          </div>

          {/* Resources Grid */}
          <div className="max-w-6xl mx-auto">
            {filteredResources.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('noResults')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((resource, index) => (
                  <Card
                    key={index}
                    className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {resource.type}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{resource.title}</CardTitle>
                      <CardDescription className="text-base">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('viewPdf')}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
            <p>Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span></p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
