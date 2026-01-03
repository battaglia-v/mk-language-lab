import { redirect } from 'next/navigation';

interface UpgradePageProps {
  params: Promise<{ locale: string }>;
}

// Upgrade page temporarily disabled - app is free for launch
export default async function UpgradePage({ params }: UpgradePageProps) {
  const { locale } = await params;
  redirect(`/${locale}/learn`);
}
