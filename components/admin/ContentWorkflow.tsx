'use client';

/**
 * Content Workflow Components
 * 
 * Reusable UI components for the Andri reviewer workflow:
 * - ContentStatusBadge: Visual indicator of content status
 * - ContentStatusTabs: Filter tabs for status
 * - ContentWorkflowActions: Approve/Publish/Reject buttons
 * - ContentEditHistory: Panel showing change log
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileEdit, 
  Eye, 
  CheckCircle, 
  Globe, 
  ChevronRight,
  Clock,
  User,
  History,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAvailableActions } from '@/lib/admin';

// =====================================================
// TYPES
// =====================================================

export type ContentStatus = 'draft' | 'needs_review' | 'approved' | 'published';

interface ContentStatusBadgeProps {
  status: ContentStatus;
  size?: 'sm' | 'md';
  className?: string;
}

interface ContentStatusTabsProps {
  activeStatus: ContentStatus | 'all';
  onStatusChange: (status: ContentStatus | 'all') => void;
  counts?: Partial<Record<ContentStatus | 'all', number>>;
  className?: string;
}

interface ContentWorkflowActionsProps {
  contentId: string;
  contentType: string;
  currentStatus: ContentStatus;
  userRole: string | undefined;
  onAction: (action: string, contentId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface EditLogEntry {
  id: string;
  action: string;
  userId: string;
  userName?: string;
  changes?: Record<string, unknown>;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  createdAt: string;
}

interface ContentEditHistoryProps {
  entries: EditLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// =====================================================
// STATUS BADGE
// =====================================================

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    className: 'bg-muted text-muted-foreground',
  },
  needs_review: {
    label: 'Needs Review',
    icon: Eye,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/30',
  },
  published: {
    label: 'Published',
    icon: Globe,
    className: 'bg-primary/10 text-primary border-primary/30',
  },
};

export function ContentStatusBadge({ 
  status, 
  size = 'md',
  className 
}: ContentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
    </span>
  );
}

// =====================================================
// STATUS TABS
// =====================================================

const TAB_ORDER: (ContentStatus | 'all')[] = ['all', 'draft', 'needs_review', 'approved', 'published'];

export function ContentStatusTabs({
  activeStatus,
  onStatusChange,
  counts = {},
  className,
}: ContentStatusTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {TAB_ORDER.map((status) => {
        const isActive = activeStatus === status;
        const count = counts[status] ?? 0;
        const config = status === 'all' ? null : STATUS_CONFIG[status];

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {config && <config.icon className="h-4 w-4" />}
            <span>{status === 'all' ? 'All' : config?.label}</span>
            {count > 0 && (
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-xs',
                isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// =====================================================
// WORKFLOW ACTIONS
// =====================================================

export function ContentWorkflowActions({
  contentId,
  contentType: _contentType, // Reserved for future content-specific actions
  currentStatus,
  userRole,
  onAction,
  isLoading = false,
  className,
}: ContentWorkflowActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const availableActions = getAvailableActions(userRole, currentStatus);

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    try {
      await onAction(action, contentId);
    } finally {
      setLoadingAction(null);
    }
  };

  // Map actions to button configs
  const actionButtons: Record<string, { 
    label: string; 
    icon: React.ReactNode; 
    variant: 'default' | 'outline' | 'destructive';
    targetStatus?: ContentStatus;
  }> = {
    submit_for_review: {
      label: 'Submit for Review',
      icon: <Eye className="h-4 w-4" />,
      variant: 'outline',
      targetStatus: 'needs_review',
    },
    approve: {
      label: 'Approve',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'default',
      targetStatus: 'approved',
    },
    publish: {
      label: 'Publish',
      icon: <Globe className="h-4 w-4" />,
      variant: 'default',
      targetStatus: 'published',
    },
    unpublish: {
      label: 'Unpublish',
      icon: <FileEdit className="h-4 w-4" />,
      variant: 'outline',
      targetStatus: 'draft',
    },
  };

  // Filter to only show relevant actions
  const actionsToShow = availableActions.filter(
    (action) => action !== 'edit' && action !== 'delete' && actionButtons[action]
  );

  if (actionsToShow.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Status flow indicator */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ContentStatusBadge status={currentStatus} size="sm" />
        {actionsToShow.length > 0 && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="hidden sm:inline">
              {actionButtons[actionsToShow[0]]?.targetStatus && (
                <ContentStatusBadge 
                  status={actionButtons[actionsToShow[0]].targetStatus!} 
                  size="sm" 
                />
              )}
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      {actionsToShow.map((action) => {
        const config = actionButtons[action];
        if (!config) return null;

        return (
          <Button
            key={action}
            size="sm"
            variant={config.variant}
            onClick={() => handleAction(action)}
            disabled={isLoading || loadingAction !== null}
          >
            {loadingAction === action ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              config.icon
            )}
            <span className="ml-1.5 hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

// =====================================================
// EDIT HISTORY PANEL
// =====================================================

export function ContentEditHistory({
  entries,
  isOpen,
  onClose,
  className,
}: ContentEditHistoryProps) {
  const actionLabels: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    status_change: 'Status changed',
    approve: 'Approved',
    publish: 'Published',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border bg-background shadow-xl',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Edit History</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 65px)' }}>
              {entries.length === 0 ? (
                <p className="text-center text-muted-foreground">No edit history available</p>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="relative border-l-2 border-border pl-4"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {actionLabels[entry.action] || entry.action}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{entry.userName || entry.userId}</span>
                        </div>

                        {/* Status change */}
                        {entry.previousStatus && entry.newStatus && (
                          <div className="flex items-center gap-2 text-sm">
                            <ContentStatusBadge status={entry.previousStatus as ContentStatus} size="sm" />
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <ContentStatusBadge status={entry.newStatus as ContentStatus} size="sm" />
                          </div>
                        )}

                        {/* Notes */}
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =====================================================
// HOOK FOR MANAGING WORKFLOW STATE
// =====================================================

export function useContentWorkflow() {
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<EditLogEntry[]>([]);

  const openHistory = async (contentId: string, contentType: string) => {
    setSelectedContentId(contentId);
    
    // Fetch edit history
    try {
      const response = await fetch(
        `/api/admin/content-history?contentType=${contentType}&contentId=${contentId}`
      );
      if (response.ok) {
        const data = await response.json();
        setEditHistory(data);
      }
    } catch (error) {
      console.error('Error fetching edit history:', error);
      setEditHistory([]);
    }
    
    setHistoryOpen(true);
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedContentId(null);
  };

  return {
    statusFilter,
    setStatusFilter,
    historyOpen,
    selectedContentId,
    editHistory,
    openHistory,
    closeHistory,
  };
}

