'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, AlertCircle, CheckCircle2, X } from 'lucide-react';

type CSVRow = {
  macedonian: string;
  english: string;
  pronunciation?: string;
  partOfSpeech?: string;
  exampleMk?: string;
  exampleEn?: string;
  icon?: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  formality?: 'formal' | 'neutral' | 'informal';
  usageContext?: string;
  includeInWOTD?: string;
};

type ImportResult = {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors?: Array<{
    rowIndex: number;
    errors: string[];
    data: Record<string, unknown>;
  }>;
};

export function BulkImportCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const downloadTemplate = () => {
    // Template uses Cyrillic script for Macedonian words
    const template = `macedonian,english,pronunciation,partOfSpeech,exampleMk,exampleEn,icon,category,difficulty,formality,usageContext,includeInWOTD
здраво,hello,ZDRAH-voh,greeting,Здраво! Како си?,Hello! How are you?,waving hand,greetings,beginner,neutral,Informal greeting with friends and family,false
добар ден,good day,DOH-bar den,greeting,Добар ден! Како сте?,Good day! How are you?,person in suit,greetings,beginner,formal,Formal greeting in professional or polite settings,false
книга,book,KNEE-gah,noun,Јас читам книга.,I am reading a book.,book,objects,beginner,neutral,Common word for physical or digital books,false`;

    // Add UTF-8 BOM for proper encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setResult(null);

    Papa.parse<CSVRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 10)); // Preview first 10 rows
      },
      error: (error) => {
        alert(`Error parsing CSV: ${error.message}`);
        setFile(null);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await fetch('/api/admin/practice-vocabulary/bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: results.data }),
          });

          const data: ImportResult = await response.json();
          setResult(data);

          if (data.success && data.failed === 0) {
            setFile(null);
            setPreview([]);
          }
        } catch (error) {
          setResult({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to import',
            imported: 0,
            failed: results.data.length,
          });
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        setResult({
          success: false,
          message: `CSV parsing error: ${error.message}`,
          imported: 0,
          failed: 0,
        });
        setImporting(false);
      },
    });
  };

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import Vocabulary (CSV)</CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple vocabulary words at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="text-sm">
            <p className="font-medium">Need a template?</p>
            <p className="text-muted-foreground">Download a sample CSV with proper Cyrillic examples</p>
            <p className="text-muted-foreground text-xs mt-1">Tip: For icons, use English descriptions like &quot;book&quot; or &quot;waving hand&quot; instead of emojis</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* File Upload Area */}
        {!file && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="csv-upload" className="cursor-pointer">
                Select CSV File
              </label>
            </Button>
          </div>
        )}

        {/* File Selected + Preview */}
        {file && preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Preview of first {preview.length} rows
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left font-medium">Macedonian</th>
                    <th className="p-2 text-left font-medium">English</th>
                    <th className="p-2 text-left font-medium">Category</th>
                    <th className="p-2 text-left font-medium">Difficulty</th>
                    <th className="p-2 text-left font-medium">WOTD</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/30">
                      <td className="p-2">{row.macedonian}</td>
                      <td className="p-2">{row.english}</td>
                      <td className="p-2">{row.category || '-'}</td>
                      <td className="p-2">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-primary/10 text-primary">
                          {row.difficulty}
                        </span>
                      </td>
                      <td className="p-2">{row.includeInWOTD ? '✓' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Import Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clearFile} disabled={importing}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? 'Importing...' : 'Import Vocabulary'}
              </Button>
            </div>
          </div>
        )}

        {/* Import Result */}
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <p className="font-medium mb-2">{result.message}</p>
              <div className="text-sm space-y-1">
                <p>✓ Imported: {result.imported}</p>
                {result.failed > 0 && <p>✗ Failed: {result.failed}</p>}
              </div>
              {result.errors && result.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium">
                    View {result.errors.length} error(s)
                  </summary>
                  <div className="mt-2 space-y-2 text-xs">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-2 bg-background rounded border">
                        <p className="font-medium">Row {err.rowIndex}:</p>
                        <ul className="list-disc list-inside pl-2">
                          {err.errors.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
