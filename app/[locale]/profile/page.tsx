import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function ProfilePage() {
  return <ProfileDashboard />;
}
