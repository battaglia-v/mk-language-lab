import { Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/layout';

export default function SettingsLoading() {
  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </PageContainer>
  );
}
