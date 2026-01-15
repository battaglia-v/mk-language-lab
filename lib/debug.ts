/**
 * Debug utilities for alpha testing
 *
 * Enable debug mode by adding ?debug=1 to any URL
 * This provides:
 * - Console logging of exercise state transitions
 * - Console logging of validation triggers
 * - Console logging of save progress calls
 */

// Check if debug mode is enabled (browser only)
export function isDebugMode(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

// Debug log levels
export type DebugLevel = 'info' | 'warn' | 'error' | 'success';

const LOG_STYLES: Record<DebugLevel, string> = {
  info: 'color: #60a5fa; font-weight: bold;',
  warn: 'color: #fbbf24; font-weight: bold;',
  error: 'color: #f87171; font-weight: bold;',
  success: 'color: #34d399; font-weight: bold;',
};

/**
 * Log debug message (only when debug mode is enabled)
 */
export function debugLog(
  category: string,
  message: string,
  data?: unknown,
  level: DebugLevel = 'info'
): void {
  if (!isDebugMode()) return;

  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}] [${category}]`;

  if (data !== undefined) {
    console.log(`%c${prefix} ${message}`, LOG_STYLES[level], data);
  } else {
    console.log(`%c${prefix} ${message}`, LOG_STYLES[level]);
  }
}

/**
 * Log exercise state transition
 */
export function debugExercise(
  exerciseId: string,
  exerciseType: string,
  event: string,
  details?: Record<string, unknown>
): void {
  debugLog(
    'EXERCISE',
    `${exerciseType}:${exerciseId} - ${event}`,
    details,
    'info'
  );
}

/**
 * Log validation event
 */
export function debugValidation(
  exerciseId: string,
  trigger: 'check_button' | 'enter_key' | 'auto_submit',
  result: { isCorrect: boolean; answer?: unknown }
): void {
  debugLog(
    'VALIDATION',
    `${exerciseId} triggered by ${trigger}`,
    result,
    result.isCorrect ? 'success' : 'warn'
  );
}

/**
 * Log save progress event
 */
export function debugSave(
  lessonId: string,
  status: 'pending' | 'success' | 'failed' | 'queued',
  details?: Record<string, unknown>
): void {
  debugLog(
    'SAVE',
    `${lessonId} - ${status}`,
    details,
    status === 'success' ? 'success' : status === 'failed' ? 'error' : 'info'
  );
}

/**
 * Log network error
 */
export function debugNetworkError(
  url: string,
  error: Error | string,
  context?: Record<string, unknown>
): void {
  debugLog(
    'NETWORK',
    `Failed: ${url}`,
    { error: error instanceof Error ? error.message : error, ...context },
    'error'
  );
}

/**
 * Debug panel data for display (when debug mode is enabled)
 */
export interface DebugPanelState {
  lessonId?: string;
  exerciseId?: string;
  exerciseType?: string;
  state?: 'idle' | 'answering' | 'submitted' | 'feedback';
  lastValidationReason?: 'check_button' | 'enter_key' | 'auto_submit';
  lastSaveStatus?: 'ok' | 'failed' | 'queued';
  pendingAnswer?: boolean;
}

// Global debug state (for debug panel)
let debugPanelState: DebugPanelState = {};

export function setDebugState(updates: Partial<DebugPanelState>): void {
  debugPanelState = { ...debugPanelState, ...updates };
  if (isDebugMode()) {
    debugLog('STATE', 'Updated', debugPanelState);
  }
}

export function getDebugState(): DebugPanelState {
  return debugPanelState;
}

export function clearDebugState(): void {
  debugPanelState = {};
}
