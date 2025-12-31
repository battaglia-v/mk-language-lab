import { redirect } from 'next/navigation';

export default function ClozePage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/practice/word-sprint`);
}
