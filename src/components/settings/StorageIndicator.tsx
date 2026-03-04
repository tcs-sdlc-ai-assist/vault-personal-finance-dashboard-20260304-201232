import React from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { formatStorageSize } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import ProgressBar from 'src/components/ui/ProgressBar';
import Tooltip from 'src/components/ui/Tooltip';
import Badge from 'src/components/ui/Badge';
import { AlertTriangle, Ban } from 'lucide-react';

/************************************************************
 * StorageIndicator.tsx
 * Vault - Storage usage indicator for settings/sidebar.
 * - Shows localStorage usage as progress bar and text.
 * - Warns at 80% usage, blocks import >4MB.
 * - Accessible and responsive.
 ************************************************************/

/**
 * StorageIndicator
 * - Visual indicator of localStorage usage.
 * - Warns at 80% and blocks import >4MB.
 * - Used in settings and sidebar.
 */
const StorageIndicator: React.FC = () => {
  // Get quota info from finance store
  const quota = useFinanceStore((state) => state.quota);

  // Thresholds
  const WARNING_PERCENT = 80;
  const BLOCK_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

  // Compute status
  const percentUsed = quota.percentUsed;
  const isWarning = percentUsed >= WARNING_PERCENT && percentUsed < 100;
  const isFull = percentUsed >= 100;
  const isBlocked = quota.usedBytes >= BLOCK_SIZE_BYTES;

  // Accessible label
  const ariaLabel = `Storage usage: ${formatStorageSize(quota.usedBytes)} of ${formatStorageSize(quota.maxBytes)} (${percentUsed.toFixed(1)}%)`;

  // Status message
  let statusMsg = '';
  let statusIcon: React.ReactNode = null;
  let statusColor = 'info';

  if (isFull) {
    statusMsg = 'Storage Full';
    statusIcon = <Ban className="w-4 h-4 text-error" aria-hidden />;
    statusColor = 'error';
  } else if (isWarning) {
    statusMsg = 'Storage Nearly Full';
    statusIcon = <AlertTriangle className="w-4 h-4 text-warning" aria-hidden />;
    statusColor = 'warning';
  } else {
    statusMsg = 'Storage OK';
    statusIcon = null;
    statusColor = 'success';
  }

  // Blocked import warning
  const blockedMsg = isBlocked
    ? 'Import blocked: file exceeds 4MB limit.'
    : '';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 shadow-sm',
        'glass'
      )}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <span className="font-heading text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Storage Usage
        </span>
        <Tooltip content={ariaLabel}>
          <Badge
            color={statusColor}
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs',
              statusColor === 'error' && 'animate-pulse'
            )}
          >
            {statusIcon}
            {statusMsg}
          </Badge>
        </Tooltip>
      </div>
      <ProgressBar
        value={percentUsed}
        max={100}
        color={
          isFull
            ? 'error'
            : isWarning
            ? 'warning'
            : 'brand'
        }
        className={cn(
          'h-3 rounded-full',
          isFull && 'bg-error/30',
          isWarning && 'bg-warning/20'
        )}
        aria-valuenow={percentUsed}
        aria-valuemax={100}
        aria-label="Storage usage progress"
      />
      <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
        <span>
          Used: <span className="font-mono">{formatStorageSize(quota.usedBytes)}</span>
        </span>
        <span>
          Max: <span className="font-mono">{formatStorageSize(quota.maxBytes)}</span>
        </span>
      </div>
      <div className="flex items-center justify-between text-xs mt-1">
        <span>
          {percentUsed.toFixed(1)}%
        </span>
        {isBlocked && (
          <Tooltip content={blockedMsg}>
            <span className="flex items-center gap-1 text-error font-semibold">
              <Ban className="w-4 h-4" aria-hidden />
              Import blocked
            </span>
          </Tooltip>
        )}
      </div>
      {isWarning && !isFull && (
        <div className="mt-2 flex items-center gap-2 text-warning text-xs">
          <AlertTriangle className="w-4 h-4" aria-hidden />
          <span>
            Warning: Storage is nearly full. Please export or clear data to avoid issues.
          </span>
        </div>
      )}
      {isFull && (
        <div className="mt-2 flex items-center gap-2 text-error text-xs">
          <Ban className="w-4 h-4" aria-hidden />
          <span>
            Error: Storage is full. Please export or clear data to continue using Vault.
          </span>
        </div>
      )}
      {isBlocked && (
        <div className="mt-2 flex items-center gap-2 text-error text-xs">
          <Ban className="w-4 h-4" aria-hidden />
          <span>
            Import blocked: File exceeds 4MB limit. Please reduce file size.
          </span>
        </div>
      )}
    </div>
  );
};

export default StorageIndicator;