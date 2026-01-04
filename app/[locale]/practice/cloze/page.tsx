import { redirect } from 'next/navigation';

export default async function ClozePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/practice/word-sprint`);
}
