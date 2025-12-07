import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * Reader page - Currently redirects to Translate
 * TODO: Implement full Reader mode in future update
 *
 * Reader mode will feature:
 * - Longer text input (articles, stories)
 * - Word-by-word breakdown
 * - Interactive vocabulary learning
 * - Save words for practice
 */
export default async function ReaderPage() {
  const locale = await getLocale();

  // For now, redirect to translate page
  // Reader mode will be implemented as an enhancement in a future update
  redirect(`/${locale}/translate`);
}
