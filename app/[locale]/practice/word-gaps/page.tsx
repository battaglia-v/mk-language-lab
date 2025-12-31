import { redirect } from 'next/navigation';

export default function WordGapsPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/practice/word-sprint`);
}
