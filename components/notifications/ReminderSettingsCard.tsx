'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export type ReminderSettings = {
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  streakRemindersEnabled: boolean;
  dailyNudgesEnabled: boolean;
  reminderWindows: string[];
};

type ReminderSettingsCardProps = {
  className?: string;
  dataTestId?: string;
};

export function ReminderSettingsCard({ className, dataTestId }: ReminderSettingsCardProps) {
  const t = useTranslations('notifications.settings');
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [pendingSettings, setPendingSettings] = useState<ReminderSettings | null>(null);

  const { data, isLoading, error } = useQuery<{ settings: ReminderSettings }>({
    queryKey: ['reminder-settings'],
    queryFn: async () => {
      const res = await fetch('/api/reminders/settings');
      if (!res.ok) throw new Error('Failed to fetch reminder settings');
      return res.json();
    },
  });

  const settings = pendingSettings ?? data?.settings;

  const mutation = useMutation({
    mutationFn: async (payload: ReminderSettings) => {
      const res = await fetch('/api/reminders/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update settings');
      }
      return (await res.json()) as { settings: ReminderSettings };
    },
    onSuccess: (response) => {
      setPendingSettings(null);
      void queryClient.invalidateQueries({ queryKey: ['reminder-settings'] });
      addToast({
        type: 'success',
        title: t('savedTitle'),
        description: t('savedDescription'),
      });
      return response;
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: t('errorTitle'),
        description: err.message,
      });
    },
  });

  const hours = useMemo(() => Array.from({ length: 24 }, (_, hour) => hour), []);

  const handleUpdate = (partial: Partial<ReminderSettings>) => {
    if (!settings) return;
    setPendingSettings({ ...settings, ...partial });
  };

  const handleSave = () => {
    if (!settings) return;
    mutation.mutate(settings);
  };

  const disabled = isLoading || mutation.isPending || !settings;

  return (
    <section
      className={cn(
        'glass-card rounded-3xl border border-white/15 bg-white/5 p-6 text-white space-y-6',
        className
      )}
      data-testid={dataTestId}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
          {t('title')}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{t('subtitle')}</h2>
        <p className="mt-1 text-sm text-slate-200">{t('description')}</p>
      </div>

      {isLoading && !settings ? (
        <div className="space-y-4" data-testid="reminder-settings-skeleton">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`settings-skeleton-${index}`} className="h-12 rounded-2xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-red-100">
          <p className="font-semibold">{t('errorTitle')}</p>
          <p className="mt-1 text-red-100/80">{t('errorDescription')}</p>
        </div>
      ) : settings ? (
        <div className="space-y-5">
          <ToggleRow
            label={t('quietHours.label')}
            description={t('quietHours.description')}
            checked={settings.quietHoursEnabled}
            onChange={(checked) => handleUpdate({ quietHoursEnabled: checked })}
          >
            <div className="flex flex-wrap gap-3 text-slate-900">
              <Select
                value={String(settings.quietHoursStart)}
                onValueChange={(value) => handleUpdate({ quietHoursStart: Number(value) })}
                disabled={!settings.quietHoursEnabled}
              >
                <SelectTrigger className="bg-white/80 text-sm text-slate-900" size="sm">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={`start-${hour}`} value={String(hour)}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-white/80">{t('quietHours.to')}</span>
              <Select
                value={String(settings.quietHoursEnd)}
                onValueChange={(value) => handleUpdate({ quietHoursEnd: Number(value) })}
                disabled={!settings.quietHoursEnabled}
              >
                <SelectTrigger className="bg-white/80 text-sm text-slate-900" size="sm">
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  {hours.map((hour) => (
                    <SelectItem key={`end-${hour}`} value={String(hour)}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ToggleRow>

          <ToggleRow
            label={t('streakWarnings.label')}
            description={t('streakWarnings.description')}
            checked={settings.streakRemindersEnabled}
            onChange={(checked) => handleUpdate({ streakRemindersEnabled: checked })}
          />

          <ToggleRow
            label={t('dailyNudges.label')}
            description={t('dailyNudges.description')}
            checked={settings.dailyNudgesEnabled}
            onChange={(checked) => handleUpdate({ dailyNudgesEnabled: checked })}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={disabled} size="sm" className="px-6">
          {mutation.isPending ? t('saving') : t('save')}
        </Button>
        <p className="text-xs text-slate-300">{t('footerHint')}</p>
      </div>
    </section>
  );
}

type ToggleRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
};

function ToggleRow({ label, description, checked, onChange, children }: ToggleRowProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start gap-4">
        <Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-slate-300">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:00 ${suffix}`;
}
