import React, { useRef, useState } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { VaultExportData } from 'src/types/index';
import { formatDateTime, formatStorageSize } from 'src/lib/formatters';
import { downloadFile, safeParseJSON } from 'src/lib/utils';
import { AlertTriangle, Upload, Download, Info, CheckCircle, XCircle } from 'lucide-react';
import Button from 'src/components/ui/Button';
import Card from 'src/components/ui/Card';
import ProgressBar from 'src/components/ui/ProgressBar';
import Tooltip from 'src/components/ui/Tooltip';
import Badge from 'src/components/ui/Badge';

/************************************************************
 * DataExportImport.tsx
 * Vault - Settings section for data export/import.
 * - Allows user to export all app data as JSON.
 * - Allows user to import data from JSON file (with validation).
 * - Handles quota, error/success feedback, and confirmation.
 ************************************************************/

const VAULT_EXPORT_FILENAME = `vault-backup-${new Date().toISOString().slice(0, 10)}.json`;

type ImportStatus = 'idle' | 'validating' | 'success' | 'error';

const DataExportImport: React.FC = () => {
  // Store hooks
  const exportData = useFinanceStore((s) => s.exportData);
  const importData = useFinanceStore((s) => s.importData);
  const resetStore = useFinanceStore((s) => s.resetStore);
  const quota = useFinanceStore((s) => s.quota);

  const showToast = useUIStore((s) => s.toast.show);
  const showConfirm = useUIStore((s) => s.confirmDialog.show);

  // Local state for import
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<VaultExportData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Export Handler ---
  const handleExport = () => {
    try {
      const data = exportData();
      const json = JSON.stringify(data, null, 2);
      downloadFile(VAULT_EXPORT_FILENAME, json, 'application/json');
      showToast('success', 'Data exported successfully.');
    } catch (err) {
      showToast('error', 'Failed to export data.');
    }
  };

  // --- Import Handler ---
  const handleImportFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImportStatus('idle');
    setImportError(null);
    setImportPreview(null);
    setImportFileName(null);

    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportStatus('validating');

    try {
      const text = await file.text();
      // Validate JSON
      const parsed = safeParseJSON(text, null);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON file.');
      }
      // Basic shape check
      if (
        !Array.isArray(parsed.transactions) ||
        !Array.isArray(parsed.categories) ||
        !Array.isArray(parsed.budgets) ||
        !Array.isArray(parsed.savingsGoals) ||
        !Array.isArray(parsed.recurringTemplates)
      ) {
        throw new Error('File does not match Vault export format.');
      }
      setImportPreview(parsed as VaultExportData);
      setImportStatus('success');
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse file.');
      setImportStatus('error');
    }
  };

  // --- Confirm Import ---
  const handleConfirmImport = () => {
    if (!importPreview) return;
    showConfirm({
      title: 'Import Data',
      description:
        'Importing will replace all your current data with the imported backup. This cannot be undone. Continue?',
      confirmLabel: 'Import',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        try {
          importData(importPreview);
          showToast('success', 'Data imported successfully.');
          setImportStatus('idle');
          setImportPreview(null);
          setImportFileName(null);
        } catch (err) {
          showToast('error', 'Failed to import data.');
        }
      },
      onCancel: () => {
        // No action needed
      },
    });
  };

  // --- Quota Bar ---
  const quotaPercent = Math.min(quota.percentUsed, 100);

  // --- Reset Handler ---
  const handleReset = () => {
    showConfirm({
      title: 'Reset All Data',
      description:
        'This will permanently delete all your data and restore Vault to its initial state. This cannot be undone. Are you sure?',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        resetStore();
        showToast('success', 'All data has been reset.');
      },
    });
  };

  return (
    <Card className="p-6 flex flex-col gap-8 max-w-2xl mx-auto">
      <h2 className="font-heading text-xl font-bold mb-2">Data Export & Import</h2>
      <p className="text-neutral-600 dark:text-neutral-300 mb-4">
        Backup or restore your Vault data. All data is stored locally in your browser. Export a backup before clearing or importing data.
      </p>

      {/* Storage Quota */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">Storage Usage</span>
          <Tooltip content="Vault stores all your data in your browser. If you approach the quota, export and clear old data.">
            <Info className="w-4 h-4 text-info" aria-label="Info" />
          </Tooltip>
        </div>
        <ProgressBar
          value={quotaPercent}
          max={100}
          className="h-3"
          color={quotaPercent > 90 ? 'error' : quotaPercent > 75 ? 'warning' : 'brand'}
        />
        <div className="flex justify-between text-xs mt-1 text-neutral-500 dark:text-neutral-400">
          <span>
            {formatStorageSize(quota.usedBytes)} / {formatStorageSize(quota.maxBytes)}
          </span>
          <span>{quotaPercent.toFixed(1)}% used</span>
        </div>
        {quotaPercent > 90 && (
          <div className="flex items-center gap-2 mt-2 text-error">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Storage almost full! Export and clear data to avoid issues.
            </span>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="flex flex-col gap-2">
        <span className="font-medium mb-1">Export Data</span>
        <Button
          variant="outline"
          onClick={handleExport}
          iconLeft={<Download className="w-4 h-4" />}
          aria-label="Export data"
        >
          Export as JSON
        </Button>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Download a backup of all your Vault data as a JSON file.
        </span>
      </div>

      {/* Import Section */}
      <div className="flex flex-col gap-2">
        <span className="font-medium mb-1">Import Data</span>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFileChange}
            aria-label="Import data file"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            iconLeft={<Upload className="w-4 h-4" />}
            aria-label="Import data"
          >
            Choose File
          </Button>
          {importFileName && (
            <span className="text-xs text-neutral-600 dark:text-neutral-300 truncate max-w-[10rem]">
              {importFileName}
            </span>
          )}
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Import a Vault JSON backup. This will replace all your current data.
        </span>

        {/* Import Status */}
        {importStatus === 'validating' && (
          <div className="flex items-center gap-2 mt-2 text-info">
            <Info className="w-4 h-4" />
            <span>Validating file...</span>
          </div>
        )}
        {importStatus === 'error' && (
          <div className="flex items-center gap-2 mt-2 text-error">
            <XCircle className="w-4 h-4" />
            <span>{importError || 'Invalid file.'}</span>
          </div>
        )}
        {importStatus === 'success' && importPreview && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span>File valid. Ready to import.</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600 dark:text-neutral-300 mt-1">
              <Badge color="brand">
                Transactions: {importPreview.transactions.length}
              </Badge>
              <Badge color="brand">
                Categories: {importPreview.categories.length}
              </Badge>
              <Badge color="brand">
                Budgets: {importPreview.budgets.length}
              </Badge>
              <Badge color="brand">
                Savings Goals: {importPreview.savingsGoals.length}
              </Badge>
              <Badge color="brand">
                Recurring: {importPreview.recurringTemplates.length}
              </Badge>
              <Badge color="neutral">
                Exported: {formatDateTime(importPreview.exportedAt, 'MMM d, yyyy HH:mm')}
              </Badge>
              <Badge color="neutral">
                Version: {importPreview.version}
              </Badge>
            </div>
            <Button
              variant="solid"
              color="brand"
              className="mt-2 w-fit"
              onClick={handleConfirmImport}
              aria-label="Confirm import"
            >
              Import Data
            </Button>
          </div>
        )}
      </div>

      {/* Reset All Data */}
      <div className="flex flex-col gap-2 mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
        <span className="font-medium mb-1 text-error">Danger Zone</span>
        <Button
          variant="outline"
          color="error"
          onClick={handleReset}
          aria-label="Reset all data"
        >
          Reset All Data
        </Button>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          This will permanently delete all your data and restore Vault to its initial state.
        </span>
      </div>
    </Card>
  );
};

export default DataExportImport;