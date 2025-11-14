'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { ArrowUpTray, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type PracticeAudioRecord = {
  id: string;
  promptId: string;
  language: string;
  speaker?: string;
  speed?: string;
  variant?: string;
  duration?: number;
  sourceType?: string;
  cdnUrl: string;
  slowUrl?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PracticeAudioAdminPage() {
  const { data, isLoading, mutate } = useSWR<PracticeAudioRecord[]>('/api/practice/audio', fetcher);
  const entries = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => {
    const human = entries.filter((entry) => entry.sourceType !== 'tts').length;
    const tts = entries.length - human;
    return { total: entries.length, human, tts };
  }, [entries]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">Practice audio</p>
        <h1 className="text-3xl font-semibold">Audio library</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Upload and validate human-recorded clips for Quick Practice prompts. The UI below reads from the JSON fixtures
          while the Prisma-backed uploader is finalized.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled>
          <ArrowUpTray className="mr-2 h-4 w-4" />
          Upload clips (coming soon)
        </Button>
        <Button variant="outline" onClick={() => mutate()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh list
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total clips</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Human recorded</p>
          <p className="text-2xl font-semibold">{stats.human}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">TTS fallback</p>
          <p className="text-2xl font-semibold">{stats.tts}</p>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="max-h-[480px] overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Prompt</th>
                <th className="px-4 py-3">Speaker</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Links</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                  <td className="px-4 py-3 font-mono text-xs">{entry.promptId}</td>
                  <td className="px-4 py-3">{entry.speaker ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{entry.speed ?? 'normal'}</td>
                  <td className="px-4 py-3">{entry.sourceType ?? 'human'}</td>
                  <td className="px-4 py-3">{entry.duration ? `${entry.duration.toFixed(1)}s` : '—'}</td>
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
                  <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={6}>
                    No audio clips yet. Uploads will appear here after the storage pipeline is wired up.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Separator />
        <div className="flex items-center justify-between p-4 text-xs text-muted-foreground">
          <span>Fixtures load from `data/practice-audio.json`.</span>
          <span className="font-mono">Status: {isLoading ? 'Loading…' : 'Ready'}</span>
        </div>
      </Card>
    </div>
  );
}
