import { Metadata } from 'next';
import { AdminDiscoverEditor } from '@/components/discover/AdminDiscoverEditor';

export const metadata: Metadata = {
  title: 'Discover CMS',
  description: 'Curate quests, community highlights, and events for the Discover feed.',
};

export default function DiscoverAdminPage() {
  return (
    <div className="space-y-6">
      <header className="glass-card rounded-3xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Discover</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Feed editor</h1>
        <p className="mt-2 text-sm text-slate-200">
          Adjust quests, community highlights, and event rails in one place. Changes sync instantly to the
          public /discover page.
        </p>
      </header>

      <AdminDiscoverEditor />
    </div>
  );
}
