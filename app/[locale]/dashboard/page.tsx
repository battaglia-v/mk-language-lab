import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * Dashboard page - redirects to the new Learn page
 * The Learn page is now the primary home screen
 */
export default async function DashboardPage() {
  const locale = await getLocale();
  redirect(`/${locale}/learn`);
}
