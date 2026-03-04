import React, { useState } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from 'src/lib/constants';
import { formatStorageSize } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import Button from 'src/components/ui/Button';
import Select from 'src/components/ui/Select';
import Card from 'src/components/ui/Card';
import ProgressBar from 'src/components/ui/ProgressBar';
import Badge from 'src/components/ui/Badge';
import Tooltip from 'src/components/ui/Tooltip';
import Dialog from 'src/components/ui/Dialog';
import Toast from 'src/components/ui/Toast';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import EmptyState from 'src/components/ui/EmptyState';
import Skeleton from 'src/components/ui/Skeleton';
import { Info, Download, Upload, Trash2, Settings as SettingsIcon } from 'lucide-react';

/************************************************************
 * src/pages/SettingsPage.tsx
 * Vault - Settings and customization center.
 * - Currency selection, storage quota, import/export, reset, and app info.
 * - Renders all settings sections and modals.
 ************************************************************/

const APP_VERSION = '1.0.0';

const SettingsPage: React.FC = () => {
  // Finance store
  const quota = useFinanceStore((state) => state.quota);
  const exportData = useFinanceStore((state) => state.exportData);
  const importData = useFinanceStore((state) => state.importData);
  const resetStore = useFinanceStore((state) => state.resetStore);
  const migrate = useFinanceStore((state) => state.migrate);

  // UI store
  const toast = useUIStore((state) => state.toast);
  const confirmDialog = useUIStore((state) => state.confirmDialog);

  // Currency selection (local state, for demo; in real app, would persist)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  // Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string>('');

  // Export modal state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportUrl, setExportUrl] = useState<string>('');

  // Handle currency change
  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    toast.show('success', `Currency set to ${code}`);
    // In real app: persist currency to store/settings
  };

  // Handle export
  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
      setExportOpen(true);
      toast.show('success', 'Export ready. Download your backup file.');
    } catch (err) {
      toast.show('error', 'Failed to export data.');
    }
  };

  // Handle import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    setImportFile(file || null);
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import.');
      return;
    }
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      // Basic validation: must have version and transactions
      if (!data.version || !Array.isArray(data.transactions)) {
        setImportError('Invalid backup file format.');
        return;
      }
      importData(data);
      setImportOpen(false);
      toast.show('success', 'Data imported successfully.');
    } catch (err) {
      setImportError('Failed to import file. Please check the format.');
    }
  };

  // Handle reset
  const handleReset = () => {
    confirmDialog.show({
      title: 'Reset All Data',
      description: 'This will delete all your finance data and restore defaults. Are you sure?',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        resetStore();
        toast.show('success', 'App data reset to defaults.');
      },
      onCancel: () => {},
    });
  };

  // Handle migration (for demo)
  const handleMigrate = () => {
    migrate();
    toast.show('info', 'Store migrated to latest version.');
  };

  // Render quota progress
  const quotaPercent = Math.round(quota.percentUsed);
  const quotaLabel = `${formatStorageSize(quota.usedBytes)} / ${formatStorageSize(quota.maxBytes)}`;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 md:px-0">
      <h1 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-brand" />
        Settings & Customization
      </h1>

      {/* Currency Selection */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-lg">Currency</span>
          <Tooltip content="Choose your default currency for analytics and display.">
            <Info className="w-4 h-4 text-neutral-400" />
          </Tooltip>
        </div>
        <Select
          value={currency}
          onChange={handleCurrencyChange}
          options={SUPPORTED_CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.code} (${c.symbol}) - ${c.name}`,
          }))}
          aria-label="Currency"
        />
        <Badge className="mt-2" color="brand">
          Current: {currency}
        </Badge>
      </Card>

      {/* Storage Quota */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-lg">Storage Usage</span>
          <Tooltip content="Vault stores all data locally in your browser.">
            <Info className="w-4 h-4 text-neutral-400" />
          </Tooltip>
        </div>
        <ProgressBar
          value={quotaPercent}
          max={100}
          color={quotaPercent > 90 ? 'error' : 'brand'}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-neutral-500">
          <span>{quotaLabel}</span>
          <span>{quotaPercent}% used</span>
        </div>
        {quotaPercent > 90 && (
          <Badge color="error" className="mt-2">
            Near quota limit! Consider exporting or clearing data.
          </Badge>
        )}
      </Card>

      {/* Import/Export */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-lg">Backup & Restore</span>
          <Tooltip content="Export your data for backup, or import from a previous backup.">
            <Info className="w-4 h-4 text-neutral-400" />
          </Tooltip>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            aria-label="Export Data"
          >
            Export Data
          </Button>
          <Button
            variant="outline"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setImportOpen(true)}
            aria-label="Import Data"
          >
            Import Data
          </Button>
        </div>
      </Card>

      {/* Reset */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-lg">Reset App</span>
          <Tooltip content="Restore Vault to default state. All your data will be deleted.">
            <Info className="w-4 h-4 text-neutral-400" />
          </Tooltip>
        </div>
        <Button
          variant="danger"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={handleReset}
          aria-label="Reset App"
        >
          Reset All Data
        </Button>
      </Card>

      {/* App Info */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-lg">App Info</span>
        </div>
        <div className="text-sm text-neutral-500 mb-2">
          Vault v{APP_VERSION} &mdash; Privacy-first, client-side personal finance dashboard.
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleMigrate}
            aria-label="Migrate Store"
          >
            Migrate Store
          </Button>
          <Badge color="brand">Version: {APP_VERSION}</Badge>
        </div>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen} title="Import Backup">
        <div>
          <input
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            aria-label="Backup File"
            className="mb-2"
          />
          {importError && (
            <Badge color="error" className="mb-2">
              {importError}
            </Badge>
          )}
          <Button
            variant="brand"
            onClick={handleImport}
            disabled={!importFile}
            aria-label="Import"
          >
            Import
          </Button>
        </div>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen} title="Export Backup">
        <div>
          {exportUrl ? (
            <a
              href={exportUrl}
              download={`vault-backup-${APP_VERSION}.json`}
              className={cn(
                'inline-block px-4 py-2 bg-brand text-white rounded-md mt-2',
                'hover:bg-brand-dark transition'
              )}
              aria-label="Download Backup"
              onClick={() => setExportOpen(false)}
            >
              Download Backup File
            </a>
          ) : (
            <Skeleton className="h-8 w-32 mt-2" />
          )}
        </div>
      </Dialog>

      {/* Toast and ConfirmDialog are global, but render here for completeness */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={toast.close}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </div>
  );
};

export default SettingsPage;