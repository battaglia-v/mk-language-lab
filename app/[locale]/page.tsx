import { redirect } from 'next/navigation';
import { locales } from '@/i18n';

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleRedirect({ params }: LocalePageProps) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as (typeof locales)[number]) ? locale : locales[0];
  redirect(`/${safeLocale}/dashboard`);
}
