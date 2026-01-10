import { getTranslations } from 'next-intl/server';
import ToolsPageClient from '@/components/tools/ToolsPageClient';

type ToolMode = 'translate' | 'analyze';

interface ToolsPageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = await searchParams;
  const t = await getTranslations('tools');

  // Validate mode from URL params, default to 'translate'
  const rawMode = params.mode;
  const initialMode: ToolMode = rawMode === 'analyze' ? 'analyze' : 'translate';

  return (
    <ToolsPageClient
      initialMode={initialMode}
      labels={{
        title: t('title'),
        translateTab: t('translateTab'),
        analyzeTab: t('analyzeTab'),
      }}
    />
  );
}
