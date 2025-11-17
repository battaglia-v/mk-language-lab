'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Loader2, Plus, RefreshCcw, Save, Trash2 } from 'lucide-react';
import type { DiscoverCommunityHighlight, DiscoverEvent, DiscoverFeed, DiscoverQuestHighlight } from '@mk/api-client';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((response) => {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
});

type EditableSection = 'quests' | 'community' | 'events';

export function AdminDiscoverEditor() {
  const { data, error, isLoading, mutate } = useSWR<DiscoverFeed>('/api/admin/discover/feed', fetcher, {
    revalidateOnFocus: false,
  });
  const [draft, setDraft] = useState<DiscoverFeed | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const feed = draft ?? data;

  useEffect(() => {
    if (data && !draft) {
      setDraft(data);
    }
  }, [data, draft]);

  const totals = useMemo(() => {
    if (!feed) return null;
    return {
      categories: feed.categories.length,
      quests: feed.quests.length,
      community: feed.community.length,
      events: feed.events.length,
    };
  }, [feed]);

  async function handleSave() {
    if (!draft) return;
    setIsSaving(true);
    setToast(null);
    try {
      const response = await fetch('/api/admin/discover/feed', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!response.ok) {
        throw new Error('Unable to save feed');
      }
      await mutate(draft, { revalidate: false });
      setToast('Discover feed updated');
    } catch (saveError) {
      console.error(saveError);
      setToast('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }

  function resetDraft() {
    if (data) {
      setDraft(data);
      setToast('Reverted changes');
    }
  }

  function handleFieldChange(section: EditableSection, index: number, field: string, value: string | number) {
    setDraft((prev) => {
      if (!prev) return prev;
      if (section === 'quests') {
        const quests = [...prev.quests];
        quests[index] = { ...quests[index], [field]: value } as DiscoverQuestHighlight;
        return { ...prev, quests };
      }
      if (section === 'community') {
        const community = [...prev.community];
        community[index] = { ...community[index], [field]: value } as DiscoverCommunityHighlight;
        return { ...prev, community };
      }
      const events = [...prev.events];
      events[index] = { ...events[index], [field]: value } as DiscoverEvent;
      return { ...prev, events };
    });
  }

  function addItem(section: EditableSection) {
    setDraft((prev) => {
      if (!prev) return prev;
      const entry = buildDefaultEntry(section);
      if (section === 'quests') {
        return { ...prev, quests: [...prev.quests, entry as DiscoverQuestHighlight] };
      }
      if (section === 'community') {
        return { ...prev, community: [...prev.community, entry as DiscoverCommunityHighlight] };
      }
      return { ...prev, events: [...prev.events, entry as DiscoverEvent] };
    });
  }

  function removeItem(section: EditableSection, index: number) {
    setDraft((prev) => {
      if (!prev) return prev;
      if (section === 'quests') {
        return { ...prev, quests: prev.quests.filter((_, i) => i !== index) };
      }
      if (section === 'community') {
        return { ...prev, community: prev.community.filter((_, i) => i !== index) };
      }
      return { ...prev, events: prev.events.filter((_, i) => i !== index) };
    });
  }

  if (isLoading || !feed) {
    return (
      <section className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Loading Discover feed…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="glass-card rounded-3xl border border-destructive/40 p-6 text-red-100">
        <p>Unable to load Discover feed. Please refresh.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl p-6 md:p-8 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110',
              isSaving && 'opacity-70'
            )}
            onClick={handleSave}
            disabled={isSaving || !draft}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving…' : 'Save feed'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10"
            onClick={resetDraft}
            disabled={!data}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
          {toast ? <p className="text-sm text-emerald-200">{toast}</p> : null}
        </div>
        {totals ? (
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-200 md:grid-cols-4">
            <div>
              <dt className="uppercase tracking-wide text-white/60">Categories</dt>
              <dd className="text-2xl font-semibold text-white">{totals.categories}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-white/60">Quests</dt>
              <dd className="text-2xl font-semibold text-white">{totals.quests}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-white/60">Community</dt>
              <dd className="text-2xl font-semibold text-white">{totals.community}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-white/60">Events</dt>
              <dd className="text-2xl font-semibold text-white">{totals.events}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <SectionEditor
        title="Quest rail"
        description="Update the cards that surface progress, XP rewards, and CTA targets."
        items={feed.quests}
        onAdd={() => addItem('quests')}
        onRemove={(index) => removeItem('quests', index)}
        render={(quest, index) => (
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Title"
              value={quest.title}
              onChange={(value) => handleFieldChange('quests', index, 'title', value)}
            />
            <InputField
              label="Progress label"
              value={quest.progressLabel}
              onChange={(value) => handleFieldChange('quests', index, 'progressLabel', value)}
            />
            <InputField
              label="CTA"
              value={quest.cta}
              onChange={(value) => handleFieldChange('quests', index, 'cta', value)}
            />
            <InputField
              label="CTA URL"
              value={quest.ctaUrl ?? ''}
              onChange={(value) => handleFieldChange('quests', index, 'ctaUrl', value)}
            />
          </div>
        )}
      />

      <SectionEditor
        title="Community highlights"
        description="Celebrate recent achievements that appear in the Discover community rail."
        items={feed.community}
        onAdd={() => addItem('community')}
        onRemove={(index) => removeItem('community', index)}
        render={(highlight, index) => (
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Name"
              value={highlight.name}
              onChange={(value) => handleFieldChange('community', index, 'name', value)}
            />
            <InputField
              label="Badge label"
              value={highlight.highlightLabel}
              onChange={(value) => handleFieldChange('community', index, 'highlightLabel', value)}
            />
            <InputField
              label="Summary"
              value={highlight.summary}
              onChange={(value) => handleFieldChange('community', index, 'summary', value)}
            />
            <InputField
              label="CTA URL"
              value={highlight.ctaUrl ?? ''}
              onChange={(value) => handleFieldChange('community', index, 'ctaUrl', value)}
            />
          </div>
        )}
      />

      <SectionEditor
        title="Events"
        description="Control the hero events rail seen by learners across time zones."
        items={feed.events}
        onAdd={() => addItem('events')}
        onRemove={(index) => removeItem('events', index)}
        render={(event, index) => (
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Title"
              value={event.title}
              onChange={(value) => handleFieldChange('events', index, 'title', value)}
            />
            <InputField
              label="Description"
              value={event.description}
              onChange={(value) => handleFieldChange('events', index, 'description', value)}
            />
            <InputField
              label="Location"
              value={event.location}
              onChange={(value) => handleFieldChange('events', index, 'location', value)}
            />
            <InputField
              label="CTA URL"
              value={event.ctaUrl ?? ''}
              onChange={(value) => handleFieldChange('events', index, 'ctaUrl', value)}
            />
          </div>
        )}
      />
    </div>
  );
}

type SectionEditorProps<TItem> = {
  title: string;
  description: string;
  items: TItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: TItem, index: number) => React.ReactNode;
};

function SectionEditor<TItem>({ title, description, items, onAdd, onRemove, render }: SectionEditorProps<TItem>) {
  return (
    <section className="glass-card rounded-3xl p-6 md:p-8 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-200">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
          Add entry
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <article key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Entry {index + 1}</p>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-xs text-white/70 transition hover:text-red-300"
              >
                <Trash2 className="mr-1 inline h-4 w-4" /> Remove
              </button>
            </div>
            <div className="mt-4 space-y-4 text-sm text-slate-200">{render(item, index)}</div>
          </article>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-slate-300">No entries yet. Add one to get started.</p>
        ) : null}
      </div>
    </section>
  );
}

type InputFieldProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
};

function InputField({ label, value, onChange }: InputFieldProps) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-white/70">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus-visible:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function buildDefaultEntry(section: EditableSection): DiscoverQuestHighlight | DiscoverCommunityHighlight | DiscoverEvent {
  const id = `admin-${section}-${Date.now()}`;
  if (section === 'quests') {
    return {
      id,
      title: 'New quest',
      type: 'weekly',
      progressPercent: 0,
      progressLabel: '0 / 100 XP',
      xpReward: 0,
      currencyReward: 0,
      deadlineLabel: null,
      cta: 'Resume',
      ctaTarget: 'practice',
      ctaUrl: '/practice',
    } satisfies DiscoverQuestHighlight;
  }
  if (section === 'community') {
    return {
      id,
      name: 'Learner',
      summary: 'Shared accomplishment',
      highlightLabel: 'Badge',
      updatedAt: new Date().toISOString(),
      cta: 'View profile',
      ctaTarget: 'profile',
      ctaUrl: '/profile',
    } satisfies DiscoverCommunityHighlight;
  }
  return {
    id,
    title: 'New event',
    description: 'Describe the event',
    host: 'Word Lab',
    location: 'Online',
    startAt: new Date().toISOString(),
    cta: 'Learn more',
    ctaTarget: 'external',
    ctaUrl: 'https://mk-language-lab.com',
  } satisfies DiscoverEvent;
}
