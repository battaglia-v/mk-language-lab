'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TextImporterProps = {
  onImportURL: (url: string) => Promise<unknown>;
  onImportFile: (file: File) => Promise<unknown>;
  isImporting: boolean;
};

export function TextImporter({ onImportURL, onImportFile, isImporting }: TextImporterProps) {
  const t = useTranslations('translate');
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleURLImport = async () => {
    if (!url.trim()) return;

    const result = await onImportURL(url.trim());
    if (result) {
      setOpen(false);
      setUrl('');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await onImportFile(file);
    if (result) {
      setOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[40px] px-3 text-xs rounded-full border-border/60"
          data-testid="reader-import-open"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="ml-1.5">{t('readerImportButton')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[92vw] sm:max-w-[460px] p-4 sm:p-6 rounded-2xl fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg">{t('readerImportTitle')}</DialogTitle>
          <DialogDescription className="text-sm">{t('readerImportDescription')}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="url" className="text-xs sm:text-sm" data-testid="reader-import-tab-url">
              <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
              {t('readerImportFromURL')}
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs sm:text-sm" data-testid="reader-import-tab-file">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {t('readerImportFromFile')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="url-input" className="text-sm">{t('readerImportURLLabel')}</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isImporting}
                className="h-10"
                data-testid="reader-import-url-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleURLImport();
                  }
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                {t('readerImportURLHint')}
              </p>
            </div>
            <Button
              onClick={() => void handleURLImport()}
              disabled={!url.trim() || isImporting}
              className="w-full h-10"
              data-testid="reader-import-url-submit"
            >
              {isImporting ? t('readerImporting') : t('readerImportButton')}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-3 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="file-input" className="text-sm">{t('readerImportFileLabel')}</Label>
              <div className="relative">
                <Input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  onChange={(e) => void handleFileSelect(e)}
                  disabled={isImporting}
                  className="cursor-pointer h-10 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                  data-testid="reader-import-file-input"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('readerImportFileHint')}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
