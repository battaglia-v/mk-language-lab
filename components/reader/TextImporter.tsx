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
          className="min-h-[44px]"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          <span className="ml-2">{t('readerImportButton')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('readerImportTitle')}</DialogTitle>
          <DialogDescription>{t('readerImportDescription')}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              {t('readerImportFromURL')}
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileText className="h-4 w-4 mr-2" />
              {t('readerImportFromFile')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">{t('readerImportURLLabel')}</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isImporting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleURLImport();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t('readerImportURLHint')}
              </p>
            </div>
            <Button
              onClick={() => void handleURLImport()}
              disabled={!url.trim() || isImporting}
              className="w-full"
            >
              {isImporting ? t('readerImporting') : t('readerImportButton')}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="file-input">{t('readerImportFileLabel')}</Label>
              <div className="relative">
                <Input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,text/plain,application/pdf"
                  onChange={(e) => void handleFileSelect(e)}
                  disabled={isImporting}
                  className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('readerImportFileHint')}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
