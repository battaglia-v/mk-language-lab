import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * Get the current session and verify user is admin
 * Throws an error if not authenticated or not admin
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  if (session.user.role !== 'admin') {
    redirect('/'); // Redirect non-admins to homepage
  }

  return session;
}

/**
 * Check if a user has admin role (client-side helper)
 * Use this in client components with session from SessionProvider
 */
export function checkAdmin(userRole?: string): boolean {
  return userRole === 'admin';
}
