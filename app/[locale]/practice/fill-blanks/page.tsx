import { redirect } from 'next/navigation';

export default function FillBlanksPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/practice/word-sprint`);
}
