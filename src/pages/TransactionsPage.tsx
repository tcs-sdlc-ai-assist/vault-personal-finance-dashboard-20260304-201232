import React, { useState, useMemo, useCallback } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Transaction, Category } from 'src/types/index';
import useFilteredTransactions from 'src/hooks/useFilteredTransactions';
import useDateRange from 'src/hooks/useDateRange';
import useCurrency from 'src/hooks/useCurrency';
import { formatDate, formatCurrency } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import Button from 'src/components/ui/Button';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Card from 'src/components/ui/Card';
import Badge from 'src/components/ui/Badge';
import ProgressBar from 'src/components/ui/ProgressBar';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import DateDisplay from 'src/components/ui/DateDisplay';
import EmptyState from 'src/components/ui/EmptyState';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import Toast from 'src/components/ui/Toast';
import Skeleton from 'src/components/ui/Skeleton';
import Dialog from 'src/components/ui/Dialog';
import DropdownMenu from 'src/components/ui/DropdownMenu';
import Tooltip from 'src/components/ui/Tooltip';
import { DEFAULT_CATEGORIES, DATE_RANGE_PRESETS } from 'src/lib/constants';
import { transactionSchema, TransactionFormData } from 'src/schemas/transactionSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Filter, Trash2, Edit, Download, Upload, Search, ChevronDown, Circle } from 'lucide-react';

/************************************************************
 * TransactionsPage.tsx
 * Vault - Transactions route/page for SPA.
 * - Displays transaction table with filters, sorting, and pagination.
 * - Provides CRUD modals for add/edit/delete transactions.
 * - Handles import/export and quota display.
 * - Fully accessible, responsive, and animated.
 ************************************************************/

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TransactionsPage: React.FC = () => {
  // Finance store
  const {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    exportData,
    quota,
  } = useFinanceStore();

  // UI store
  const {
    searchQuery,
    setSearchQuery,
    filterCategoryId,
    setFilterCategoryId,
    filterDatePreset,
    setFilterDatePreset,
    filterDateRange,
    setFilterDateRange,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    toast,
    confirmDialog,
  } = useUIStore();

  // Date range hook (for filter UI)
  const dateRangeHook = useDateRange(filterDatePreset, {
    start: filterDateRange.startDate,
    end: filterDateRange.endDate,
  });

  // Currency hook
  const currency = useCurrency();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  // CRUD modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Filtered/sorted/paginated transactions
  const {
    transactions: filteredTx,
    total,
    totalPages,
  } = useFilteredTransactions({ page, pageSize });

  // Category options for filter/select
  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        color: cat.color,
        icon: cat.icon,
      })),
    [categories]
  );

  // Table columns
  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (tx: Transaction) => <DateDisplay date={tx.date} />,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (tx: Transaction) => (
        <Badge
          variant={tx.type === 'income' ? 'success' : 'error'}
          className="capitalize"
        >
          {tx.type}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (tx: Transaction) => (
        <CurrencyDisplay
          amount={tx.amount}
          type={tx.type}
          currency={currency.code}
        />
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (tx: Transaction) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        return (
          <Badge
            color={cat?.color || 'neutral.400'}
            icon={cat?.icon || 'Circle'}
            className="capitalize"
          >
            {cat?.name || 'Unknown'}
          </Badge>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (tx: Transaction) => (
        <span className={cn('truncate text-neutral-700 dark:text-neutral-200', !tx.description && 'text-neutral-400')}>
          {tx.description || <span className="italic text-neutral-400">—</span>}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (tx: Transaction) => (
        <div className="flex gap-xs">
          <Tooltip content="Edit">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit transaction"
              onClick={() => handleEditTx(tx)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Delete">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete transaction"
              onClick={() => handleDeleteTx(tx)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Handlers
  const handleAddTx = () => {
    setEditTx(null);
    setModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditTx(tx);
    setModalOpen(true);
  };

  const handleDeleteTx = (tx: Transaction) => {
    confirmDialog.show({
      title: 'Delete Transaction',
      description: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        deleteTransaction(tx.id);
        toast.show('success', 'Transaction deleted.');
      },
      onCancel: () => {},
    });
  };

  const handleClearAll = () => {
    confirmDialog.show({
      title: 'Clear All Transactions',
      description: 'This will permanently delete all transactions. Are you sure?',
      confirmLabel: 'Clear All',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        clearTransactions();
        toast.show('success', 'All transactions cleared.');
      },
      onCancel: () => {},
    });
  };

  const handleExport = () => {
    try {
      const data = exportData();
      const json = JSON.stringify(data, null, 2);
      const filename = `vault-transactions-${new Date().toISOString().slice(0, 10)}.json`;
      // Use downloadFile utility
      import('src/lib/utils').then(({ downloadFile }) => {
        downloadFile(filename, json, 'application/json');
        toast.show('success', 'Transactions exported.');
      });
    } catch (err) {
      toast.show('error', 'Export failed.');
    }
  };

  const handleImport = () => {
    setImportModalOpen(true);
  };

  // Transaction form (add/edit)
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editTx
      ? {
          ...editTx,
        }
      : {
          type: 'expense',
          amount: 0,
          categoryId: categories[0]?.id || '',
          date: formatDate(new Date(), 'yyyy-MM-dd'),
          description: '',
          notes: '',
        },
  });

  // Submit handler for add/edit
  const onSubmit = (data: TransactionFormData) => {
    if (editTx) {
      updateTransaction(editTx.id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      toast.show('success', 'Transaction updated.');
    } else {
      addTransaction({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.show('success', 'Transaction added.');
    }
    setModalOpen(false);
    setEditTx(null);
    form.reset();
  };

  // Import handler
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { safeParseJSON } = await import('src/lib/utils');
      const data = safeParseJSON(text, null);
      if (data && Array.isArray(data.transactions)) {
        // Import only transactions (for demo)
        // For full import, use importData from finance store
        data.transactions.forEach((tx: Transaction) => {
          addTransaction({
            ...tx,
            createdAt: tx.createdAt || new Date().toISOString(),
            updatedAt: tx.updatedAt || new Date().toISOString(),
          });
        });
        toast.show('success', 'Transactions imported.');
      } else {
        toast.show('error', 'Invalid import file.');
      }
    } catch (err) {
      toast.show('error', 'Import failed.');
    }
    setImportModalOpen(false);
  };

  // Table pagination controls
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Responsive: reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, filterCategoryId, filterDatePreset, filterDateRange]);

  // Accessibility: focus modal on open
  React.useEffect(() => {
    if (modalOpen) {
      setTimeout(() => {
        const el = document.getElementById('transaction-modal');
        if (el) el.focus();
      }, 100);
    }
  }, [modalOpen]);

  // Render
  return (
    <div className="max-w-6xl mx-auto px-lg py-xl fade-in slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md mb-lg">
        <h1 className="text-2xl font-heading font-bold text-brand-dark dark:text-brand-light">
          Transactions
        </h1>
        <div className="flex gap-xs">
          <Button variant="brand" size="md" onClick={handleAddTx} aria-label="Add Transaction">
            <Plus className="w-5 h-5 mr-xs" />
            Add Transaction
          </Button>
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="md" aria-label="More actions">
                <ChevronDown className="w-4 h-4 mr-xs" />
                Actions
              </Button>
            }
            items={[
              {
                label: 'Export',
                icon: <Download className="w-4 h-4" />,
                onClick: handleExport,
              },
              {
                label: 'Import',
                icon: <Upload className="w-4 h-4" />,
                onClick: handleImport,
              },
              {
                label: 'Clear All',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: handleClearAll,
                className: 'text-error',
              },
            ]}
          />
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-lg p-md flex flex-col md:flex-row md:items-center gap-md">
        <div className="flex flex-1 gap-xs items-center">
          <Input
            type="search"
            placeholder="Search description, notes, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-neutral-400" />}
            className="w-full md:w-64"
            aria-label="Search transactions"
          />
          <Select
            options={[
              { value: '', label: 'All Categories', icon: <Circle className="w-4 h-4" /> },
              ...categoryOptions.map((cat) => ({
                value: cat.value,
                label: cat.label,
                icon: cat.icon ? <Circle className="w-4 h-4" /> : undefined,
              })),
            ]}
            value={filterCategoryId || ''}
            onChange={(val) => setFilterCategoryId(val || null)}
            className="w-48"
            aria-label="Filter by category"
          />
          <Select
            options={DATE_RANGE_PRESETS.map((preset) => ({
              value: preset.key,
              label: preset.label,
            }))}
            value={filterDatePreset}
            onChange={(val) => {
              setFilterDatePreset(val);
              const presetRange = dateRangeHook.getPresetDateRange(val);
              setFilterDateRange(presetRange);
            }}
            className="w-48"
            aria-label="Filter by date range"
          />
        </div>
        <div className="flex gap-xs items-center">
          <Select
            options={PAGE_SIZE_OPTIONS.map((size) => ({
              value: size,
              label: `${size} / page`,
            }))}
            value={pageSize}
            onChange={(val) => handlePageSizeChange(Number(val))}
            className="w-32"
            aria-label="Page size"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset filters"
            onClick={() => {
              setSearchQuery('');
              setFilterCategoryId(null);
              setFilterDatePreset('thisMonth');
              setFilterDateRange(dateRangeHook.getPresetDateRange('thisMonth'));
            }}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Quota display */}
      <div className="mb-md flex items-center gap-xs">
        <ProgressBar
          value={quota.percentUsed}
          max={100}
          color={quota.percentUsed > 90 ? 'error' : 'brand'}
          className="w-48"
        />
        <span className="text-xs text-neutral-500 dark:text-neutral-300">
          Storage: {quota.usedBytes ? `${(quota.usedBytes / 1024).toFixed(1)} KB` : '0 KB'} / 5 MB
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        {total === 0 ? (
          <EmptyState
            title="No Transactions"
            description="Add your first transaction to get started."
            actionLabel="Add Transaction"
            actionIcon={<Plus className="w-5 h-5" />}
            onAction={handleAddTx}
          />
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'py-xs px-sm text-left font-semibold text-neutral-600 dark:text-neutral-200',
                      col.sortable && 'cursor-pointer hover:text-brand-dark'
                    )}
                    onClick={() => col.sortable && setSortField(col.key)}
                  >
                    {col.label}
                    {col.sortable && sortField === col.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-lg text-center text-neutral-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
                    {columns.map((col) => (
                      <td key={col.key} className="py-xs px-sm">
                        {col.render(tx)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-xs mt-md">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Prev
          </Button>
          <span className="text-xs text-neutral-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        aria-labelledby="transaction-modal-title"
        id="transaction-modal"
      >
        <Dialog.Content className="max-w-md">
          <Dialog.Title id="transaction-modal-title">
            {editTx ? 'Edit Transaction' : 'Add Transaction'}
          </Dialog.Title>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-md"
            autoComplete="off"
          >
            <Select
              label="Type"
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
              value={form.watch('type')}
              onChange={(val) => form.setValue('type', val)}
              required
            />
            <Input
              label="Amount"
              type="number"
              min={0.01}
              step={0.01}
              value={form.watch('amount')}
              onChange={(e) => form.setValue('amount', Number(e.target.value))}
              required
              icon={<CurrencyDisplay amount={form.watch('amount') || 0} currency={currency.code} />}
            />
            <Select
              label="Category"
              options={categoryOptions.map((cat) => ({
                value: cat.value,
                label: cat.label,
                icon: cat.icon ? <Circle className="w-4 h-4" /> : undefined,
              }))}
              value={form.watch('categoryId')}
              onChange={(val) => form.setValue('categoryId', val)}
              required
            />
            <Input
              label="Date"
              type="date"
              value={form.watch('date')}
              onChange={(e) => form.setValue('date', e.target.value)}
              required
            />
            <Input
              label="Description"
              value={form.watch('description')}
              onChange={(e) => form.setValue('description', e.target.value)}
              maxLength={128}
              placeholder="Optional"
            />
            <Input
              label="Notes"
              value={form.watch('notes')}
              onChange={(e) => form.setValue('notes', e.target.value)}
              maxLength={512}
              placeholder="Optional"
            />
            <div className="flex justify-end gap-xs">
              <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="brand" type="submit">
                {editTx ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog>

      {/* Import Modal */}
      <Dialog
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        aria-labelledby="import-modal-title"
      >
        <Dialog.Content className="max-w-md">
          <Dialog.Title id="import-modal-title">Import Transactions</Dialog.Title>
          <div className="flex flex-col gap-md">
            <p className="text-neutral-700 dark:text-neutral-200">
              Upload a Vault export file (.json) to import transactions.
            </p>
            <Input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              aria-label="Import file"
            />
            <div className="flex justify-end gap-xs">
              <Button variant="ghost" type="button" onClick={() => setImportModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>

      {/* Toast and ConfirmDialog are global, but can be rendered here for route-level feedback */}
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

export default TransactionsPage;