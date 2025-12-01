'use client';

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { Upload as UploadIcon, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

type PracticeAudioRecord = {
  id: string;
  promptId: string;
  language: string;
  speaker: string | null;
  speed: string | null;
  variant: string | null;
  duration: number | null;
  sourceType: 'human' | 'tts';
  status: 'draft' | 'processing' | 'published' | 'archived';
  cdnUrl: string;
  slowUrl: string | null;
  waveform: number[] | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type UploadState = {
  type: 'success' | 'error';
  message: string;
} | null;

function UploadPracticeAudioForm({ onUploaded }: { onUploaded: () => void }) {
  const [message, setMessage] = useState<UploadState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/practice-audio', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? 'Failed to upload audio clip');
      }
      setMessage({ type: 'success', message: 'Audio clip uploaded successfully.' });
      form.reset();
      onUploaded();
    } catch (error) {
      setMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload audio clip',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 space-y-1">
        <h2 className="text-xl font-semibold">Upload new audio</h2>
        <p className="text-sm text-muted-foreground">
          Attach MP3/WAV clips for existing prompts. Files upload to the configured S3 bucket or Vercel Blob and are
          published immediately.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="promptId">Prompt ID</Label>
            <Input id="promptId" name="promptId" placeholder="prompt-1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" name="language" defaultValue="mk" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="speaker">Speaker</Label>
            <Input id="speaker" name="speaker" placeholder="Ana" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant">Variant</Label>
            <Input id="variant" name="variant" placeholder="female" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="speed">Speed</Label>
            <Input id="speed" name="speed" placeholder="normal" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sourceType">Source</Label>
            <select
              id="sourceType"
              name="sourceType"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
              defaultValue="human"
            >
              <option value="human">Human</option>
              <option value="tts">TTS</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input id="duration" name="duration" type="number" step="0.1" min="0" placeholder="2.8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" placeholder="Accent, recording notes…" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              value="true"
              className="h-4 w-4 rounded border-input focus:ring-2 focus:ring-primary"
            />
            <Label htmlFor="isPublished" className="cursor-pointer font-normal">
              Publish immediately (if unchecked, saves as draft)
            </Label>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primaryFile">Primary clip</Label>
            <Input id="primaryFile" name="primaryFile" type="file" accept="audio/*" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slowFile">Slow clip (optional)</Label>
            <Input id="slowFile" name="slowFile" type="file" accept="audio/*" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waveform">Waveform JSON (optional)</Label>
          <Textarea
            id="waveform"
            name="waveform"
            placeholder="[0.12, 0.24, 0.3]"
            className="min-h-20 font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Provide an array of amplitude samples if you&apos;ve precomputed waveforms.
          </p>
        </div>
        {message ? (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertTitle>{message.type === 'error' ? 'Upload failed' : 'Upload complete'}</AlertTitle>
            <AlertDescription>{message.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <UploadIcon className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Uploading…' : 'Upload clip'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function PracticeAudioAdminPage() {
  const { data, isLoading, mutate } = useSWR<PracticeAudioRecord[]>(
    '/api/practice/audio?all=1',
    fetcher,
    { refreshInterval: 0 }
  );
  const entries = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.total += 1;
        if (entry.sourceType === 'tts') {
          acc.tts += 1;
        } else {
          acc.human += 1;
        }
        if (entry.status === 'published') {
          acc.published += 1;
        } else {
          acc.unpublished += 1;
        }
        return acc;
      },
      { total: 0, human: 0, tts: 0, published: 0, unpublished: 0 }
    );
  }, [entries]);

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Practice audio</p>
        <h1 className="text-2xl sm:text-3xl font-semibold">Audio library</h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Upload and validate human-recorded clips for Quick Practice prompts. Entries sync to Prisma and power the
          Quick Practice HUD plus mobile cache worker.
        </p>
      </header>

      <UploadPracticeAudioForm onUploaded={() => mutate()} />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh list
        </Button>
      </div>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total clips</p>
          <p className="text-xl sm:text-2xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Published / Draft</p>
          <p className="text-xl sm:text-2xl font-semibold">
            {stats.published} <span className="text-sm text-muted-foreground">/ {stats.unpublished}</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Human vs TTS</p>
          <p className="text-xl sm:text-2xl font-semibold">
            {stats.human} <span className="text-sm text-muted-foreground">/ {stats.tts}</span>
          </p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="max-h-[480px] overflow-auto">
          <div className="hidden md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Prompt</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Speaker</th>
                  <th className="px-4 py-3">Speed</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Links</th>
                </tr>
              </thead>
              <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                  <td className="px-4 py-3 font-mono text-xs">{entry.promptId}</td>
                  <td className="px-4 py-3">
                    <Badge variant={entry.status === 'published' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{entry.speaker ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{entry.speed ?? 'normal'}</td>
                  <td className="px-4 py-3">{entry.sourceType ?? 'human'}</td>
                  <td className="px-4 py-3">{entry.duration ? `${entry.duration.toFixed(1)}s` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs">
                      <a href={entry.cdnUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        Primary
                      </a>
                      {entry.slowUrl ? (
                        <a href={entry.slowUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                          Slow
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
                {!isLoading && entries.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={8}>
                      No audio clips yet. Uploads will appear here after the storage pipeline is wired up.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">{entry.promptId}</span>
                  <Badge variant={entry.status === 'published' ? 'default' : 'secondary'}>
                    {entry.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Speaker:</span> {entry.speaker ?? '—'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed:</span> {entry.speed ?? 'normal'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span> {entry.sourceType ?? 'human'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>{' '}
                    {entry.duration ? `${entry.duration.toFixed(1)}s` : '—'}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString() : '—'}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" variant="outline" className="flex-1">
                    <a href={entry.cdnUrl} target="_blank" rel="noreferrer">
                      Primary
                    </a>
                  </Button>
                  {entry.slowUrl && (
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <a href={entry.slowUrl} target="_blank" rel="noreferrer">
                        Slow
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {!isLoading && entries.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No audio clips yet. Uploads will appear here after the storage pipeline is wired up.
              </p>
            )}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 text-xs text-muted-foreground">
          <span>Backed by Prisma PracticeAudio (fixtures act as fallback only).</span>
          <span className="font-mono">Status: {isLoading ? 'Loading…' : 'Ready'}</span>
        </div>
      </Card>
    </div>
  );
}
