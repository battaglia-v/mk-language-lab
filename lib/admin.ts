import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * User roles in the system:
 * - 'user': Regular learner (default)
 * - 'reviewer': Can edit content and approve, but cannot publish
 * - 'admin': Full access including publishing
 */
export type UserRole = 'user' | 'reviewer' | 'admin';

/**
 * Content workflow actions and their required permissions
 */
export const CONTENT_PERMISSIONS = {
  // Who can perform each action
  create: ['reviewer', 'admin'] as UserRole[],
  edit: ['reviewer', 'admin'] as UserRole[],
  submit_for_review: ['reviewer', 'admin'] as UserRole[],
  approve: ['reviewer', 'admin'] as UserRole[],
  publish: ['admin'] as UserRole[], // Only admins can publish
  unpublish: ['admin'] as UserRole[],
  delete: ['admin'] as UserRole[],
};

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * Check if the current user is a reviewer (or admin)
 */
export async function isReviewer(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'reviewer' || session?.user?.role === 'admin';
}

/**
 * Check if user can access the admin panel (reviewers and admins)
 */
export async function canAccessAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'reviewer' || session?.user?.role === 'admin';
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
 * Get the current session and verify user can access admin panel (reviewer or admin)
 * Use this for admin routes that reviewers can access
 */
export async function requireReviewerOrAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  const role = session.user.role;
  if (role !== 'reviewer' && role !== 'admin') {
    redirect('/'); // Redirect regular users to homepage
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

/**
 * Check if a user has reviewer or admin role (client-side helper)
 */
export function checkReviewerOrAdmin(userRole?: string): boolean {
  return userRole === 'reviewer' || userRole === 'admin';
}

/**
 * Check if a user can perform a specific content action
 */
export function canPerformAction(
  userRole: string | undefined,
  action: keyof typeof CONTENT_PERMISSIONS
): boolean {
  if (!userRole) return false;
  const allowedRoles = CONTENT_PERMISSIONS[action];
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * Get available actions for a user based on their role and content status
 */
export function getAvailableActions(
  userRole: string | undefined,
  contentStatus: 'draft' | 'needs_review' | 'approved' | 'published'
): string[] {
  const actions: string[] = [];

  if (!userRole || userRole === 'user') return actions;

  // Both reviewers and admins can edit and submit for review
  if (canPerformAction(userRole, 'edit')) {
    actions.push('edit');
  }

  // Actions based on current status
  switch (contentStatus) {
    case 'draft':
      if (canPerformAction(userRole, 'submit_for_review')) {
        actions.push('submit_for_review');
      }
      break;

    case 'needs_review':
      if (canPerformAction(userRole, 'approve')) {
        actions.push('approve');
      }
      break;

    case 'approved':
      if (canPerformAction(userRole, 'publish')) {
        actions.push('publish');
      }
      break;

    case 'published':
      if (canPerformAction(userRole, 'unpublish')) {
        actions.push('unpublish');
      }
      break;
  }

  // Admins can always delete
  if (canPerformAction(userRole, 'delete')) {
    actions.push('delete');
  }

  return actions;
}

/**
 * Status transition rules for content workflow
 */
export const STATUS_TRANSITIONS = {
  draft: ['needs_review'],
  needs_review: ['draft', 'approved'],
  approved: ['needs_review', 'published'],
  published: ['draft', 'approved'],
} as const;

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  from: keyof typeof STATUS_TRANSITIONS,
  to: string
): boolean {
  return STATUS_TRANSITIONS[from].includes(to as never);
}
