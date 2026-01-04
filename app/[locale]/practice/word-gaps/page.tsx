import { redirect } from 'next/navigation';

export default async function WordGapsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/practice/word-sprint`);
}
