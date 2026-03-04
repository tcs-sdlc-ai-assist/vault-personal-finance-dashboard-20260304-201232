import React, { useState } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from 'src/lib/constants';
import { formatStorageSize } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import Button from 'src/components/ui/Button';
import Select from 'src/components/ui/Select';
import Card from 'src/components/ui/Card';
import ProgressBar from 'src/components/ui/ProgressBar';
import Tooltip from 'src/components/ui/Tooltip';
import EmptyState from 'src/components/ui/EmptyState';
import { Info, RefreshCw } from 'lucide-react';

/************************************************************
 * GeneralSettings.tsx
 * Vault - General settings section for preferences.
 * - Allows user to select default currency.
 * - Displays storage quota usage.
 * - Provides "Reset to Defaults" action (with confirmation).
 ************************************************************/

const GeneralSettings: React.FC = () => {
  // Finance store state and actions
  const quota = useFinanceStore((state) => state.quota);
  const version = useFinanceStore((state) => state.version);
  const resetStore = useFinanceStore((state) => state.resetStore);

  // UI store for toast and confirm dialog
  const toast = useUIStore((state) => state.toast);
  const confirmDialog = useUIStore((state) => state.confirmDialog);

  // Currency selection (local state, as currency is not persisted in store)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    toast.show('success', `Currency set to ${value}`);
    // In a real app, persist currency in store/settings
  };

  // Handle reset to defaults
  const handleReset = () => {
    confirmDialog.show({
      title: 'Reset Vault to Defaults',
      description:
        'This will clear all your data and restore Vault to its initial state. This action cannot be undone.',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        resetStore();
        toast.show('success', 'Vault has been reset to defaults.');
      },
      onCancel: () => {
        toast.show('info', 'Reset cancelled.');
      },
    });
  };

  // Storage quota info
  const percentUsed = quota.percentUsed;
  const used = formatStorageSize(quota.usedBytes);
  const max = formatStorageSize(quota.maxBytes);

  return (
    <div className="space-y-6">
      {/* Currency Preference */}
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-brand" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold">Currency Preference</h2>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="currency-select" className="text-sm font-medium">
            Default Currency
          </label>
          <Select
            id="currency-select"
            value={currency}
            onChange={handleCurrencyChange}
            options={SUPPORTED_CURRENCIES.map((c) => ({
              value: c.code,
              label: `${c.code} (${c.symbol}) - ${c.name}`,
            }))}
            className="min-w-[220px]"
            aria-label="Select default currency"
          />
        </div>
        <p className="text-xs text-neutral-500">
          All amounts are displayed in your selected currency. (For demo, currency is not persisted.)
        </p>
      </Card>

      {/* Storage Quota */}
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-brand" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold">Storage Usage</h2>
        </div>
        <div className="flex items-center gap-4">
          <ProgressBar
            value={percentUsed}
            max={100}
            color={percentUsed > 90 ? 'error' : 'brand'}
            className="w-full"
            aria-label="Storage usage"
          />
          <Tooltip content={`Used: ${used} / Max: ${max}`}>
            <span
              className={cn(
                'text-xs font-mono px-2 py-1 rounded',
                percentUsed > 90
                  ? 'bg-error-light text-error-dark'
                  : 'bg-neutral-100 text-neutral-700'
              )}
            >
              {used} / {max}
            </span>
          </Tooltip>
        </div>
        <p className="text-xs text-neutral-500">
          Vault stores all your data locally in your browser.{' '}
          {percentUsed > 90 ? (
            <span className="text-error font-semibold">Storage almost full!</span>
          ) : (
            <span>Safe and private.</span>
          )}
        </p>
      </Card>

      {/* Reset to Defaults */}
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-warning" aria-hidden="true" />
          <h2 className="font-heading text-lg font-bold">Reset Vault</h2>
        </div>
        <p className="text-sm text-neutral-600">
          Restore Vault to its initial state. <span className="font-semibold text-error">All your data will be erased.</span>
        </p>
        <Button
          variant="destructive"
          size="md"
          onClick={handleReset}
          aria-label="Reset Vault to Defaults"
        >
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          Reset to Defaults
        </Button>
      </Card>

      {/* App Version */}
      <div className="text-xs text-neutral-400 text-right">
        Vault version: <span className="font-mono">{version}</span>
      </div>
    </div>
  );
};

export default GeneralSettings;