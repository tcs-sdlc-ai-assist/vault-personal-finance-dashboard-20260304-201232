import React, { useMemo, useCallback } from 'react';
import {
  useTable,
  useSortBy,
  usePagination,
  Column,
  TableOptions,
  Row,
} from '@tanstack/react-table';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Transaction, Category } from 'src/types/index';
import { formatCurrency, formatDate } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';
import Button from 'src/components/ui/Button';
import Badge from 'src/components/ui/Badge';
import ProgressBar from 'src/components/ui/ProgressBar';
import DropdownMenu from 'src/components/ui/DropdownMenu';
import Tooltip from 'src/components/ui/Tooltip';
import Skeleton from 'src/components/ui/Skeleton';
import EmptyState from 'src/components/ui/EmptyState';
import ConfirmDialog from 'src/components/ui/ConfirmDialog';
import { ShoppingCart, Receipt, Gamepad, Plane, HeartPulse, PiggyBank, Coins, Circle, Trash2, Edit, MoreVertical } from 'lucide-react';

/************************************************************
 * TransactionTable.tsx
 * Vault - Transaction data table with full CRUD.
 * - Uses TanStack Table for sorting, pagination, bulk actions.
 * - Supports animations, accessibility, and responsive design.
 ************************************************************/

/**
 * Icon mapping for categories (lucide-react).
 */
const ICON_MAP: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart size={18} />,
  Receipt: <Receipt size={18} />,
  Gamepad: <Gamepad size={18} />,
  Plane: <Plane size={18} />,
  HeartPulse: <HeartPulse size={18} />,
  PiggyBank: <PiggyBank size={18} />,
  Coins: <Coins size={18} />,
  Circle: <Circle size={18} />,
};

/**
 * TransactionTableProps
 * - Optional: pageSize, onEdit, onDelete, onBulkDelete
 */
interface TransactionTableProps {
  pageSize?: number;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onBulkDelete?: (ids: string[]) => void;
}

/**
 * TransactionTable
 * - Displays transactions in a sortable, paginated table.
 * - Supports bulk selection, edit/delete actions, and animations.
 */
const TransactionTable: React.FC<TransactionTableProps> = ({
  pageSize = 20,
  onEdit,
  onDelete,
  onBulkDelete,
}) => {
  // Finance data
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  // UI filters and sorting
  const searchQuery = useUIStore((state) => state.searchQuery);
  const filterCategoryId = useUIStore((state) => state.filterCategoryId);
  const filterDateRange = useUIStore((state) => state.filterDateRange);
  const sortField = useUIStore((state) => state.sortField);
  const sortDirection = useUIStore((state) => state.sortDirection);

  // Local state for selection and confirm dialog
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Memoized category lookup
  const categoryMap = useMemo(() => {
    return categories.reduce<Record<string, Category>>((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});
  }, [categories]);

  // Columns definition
  const columns = useMemo<Column<Transaction>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all"
          checked={table.getIsAllRowsSelected()}
          onChange={(e) => table.toggleAllRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label="Select row"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
      size: 32,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="font-mono">{formatDate(row.original.date, 'yyyy-MM-dd')}</span>
      ),
      size: 120,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge
          variant={row.original.type === 'income' ? 'success' : 'error'}
          className="capitalize"
        >
          {row.original.type}
        </Badge>
      ),
      size: 80,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span
          className={cn(
            'font-semibold',
            row.original.type === 'income'
              ? 'text-success-dark'
              : 'text-error-dark'
          )}
        >
          {formatCurrency(row.original.amount)}
        </span>
      ),
      size: 120,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'categoryId',
      header: 'Category',
      cell: ({ row }) => {
        const cat = categoryMap[row.original.categoryId];
        return cat ? (
          <span className="flex items-center gap-2">
            <span
              className="rounded-full w-6 h-6 flex items-center justify-center"
              style={{ background: cat.color }}
              aria-label={cat.name}
            >
              {cat.icon && ICON_MAP[cat.icon] ? ICON_MAP[cat.icon] : <Circle size={18} />}
            </span>
            <span className="font-medium">{cat.name}</span>
          </span>
        ) : (
          <span className="text-neutral-400">Unknown</span>
        );
      },
      size: 160,
      sortingFn: 'basic',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Tooltip content={row.original.description || ''}>
          <span className="truncate max-w-[180px]">{row.original.description || '-'}</span>
        </Tooltip>
      ),
      size: 180,
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <Tooltip content={row.original.notes || ''}>
          <span className="truncate max-w-[180px] text-neutral-500">{row.original.notes || '-'}</span>
        </Tooltip>
      ),
      size: 180,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="sm"
              aria-label="More actions"
              icon={<MoreVertical size={18} />}
            />
          }
        >
          <DropdownMenu.Item
            icon={<Edit size={16} />}
            onClick={() => onEdit && onEdit(row.original)}
          >
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            icon={<Trash2 size={16} />}
            className="text-error-dark"
            onClick={() => onDelete && onDelete(row.original)}
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu>
      ),
      size: 48,
    },
  ], [categoryMap, onEdit, onDelete]);

  // Table options
  const tableOptions = useMemo<TableOptions<Transaction>>(() => ({
    data: transactions,
    columns,
    state: {
      // Sorting
      sorting: [
        {
          id: sortField,
          desc: sortDirection === 'desc',
        },
      ],
      // Pagination
      pagination: {
        pageIndex: 0,
        pageSize,
      },
      // Row selection
      rowSelection: {},
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableSorting: true,
    enablePagination: true,
    manualPagination: false,
    manualSorting: false,
    // Custom sorting logic if needed
  }), [transactions, columns, sortField, sortDirection, pageSize]);

  // TanStack Table instance
  const table = useTable(tableOptions, useSortBy, usePagination);

  // Bulk selection logic
  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length > 0 && onBulkDelete) {
      setConfirmOpen(false);
      onBulkDelete(selectedIds);
      setSelectedIds([]);
    }
  }, [selectedIds, onBulkDelete]);

  // Handle row selection
  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(table.getRowModel().rows.map((row) => row.original.id));
    } else {
      setSelectedIds([]);
    }
  }, [table]);

  // Loading skeleton
  if (!transactions) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions"
        description="Add your first transaction to get started."
        action={<Button variant="brand" size="md">Add Transaction</Button>}
      />
    );
  }

  // Render table
  return (
    <div className="w-full overflow-x-auto rounded-lg bg-white dark:bg-neutral-800 shadow-md glass">
      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          <span className="font-medium">{selectedIds.length} selected</span>
          <Button
            variant="error"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            {table.getHeaderGroups()[0].headers.map((header) => (
              <th
                key={header.id}
                className={cn(
                  'px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-700',
                  header.column.getCanSort() && 'cursor-pointer select-none'
                )}
                style={{ width: header.column.getSize() }}
                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                aria-sort={header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? 'descending' : 'ascending') : 'none'}
              >
                {header.isPlaceholder ? null : header.renderHeader()}
                {header.column.getIsSorted() && (
                  <span className="ml-1">
                    {header.column.getIsSorted() === 'desc' ? '▼' : '▲'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900',
                selectedIds.includes(row.original.id) && 'bg-brand-light/10'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-2 py-2 text-sm"
                  style={{ width: cell.column.getSize() }}
                >
                  {/* Selection cell */}
                  {cell.column.id === 'select' ? (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.original.id)}
                      onChange={(e) => handleSelectRow(row.original.id, e.target.checked)}
                      aria-label="Select row"
                    />
                  ) : (
                    cell.renderCell()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
        <span className="text-xs font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirm bulk delete dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete selected transactions?"
        description={`Are you sure you want to delete ${selectedIds.length} selected transactions? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default TransactionTable;