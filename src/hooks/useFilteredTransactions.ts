import { useMemo } from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { Transaction, Category, DateRange } from 'src/types/index';
import { filterTransactionsByDateRange } from 'src/lib/calculations';
import { isEmpty } from 'src/lib/utils';
import useDebounce from 'src/hooks/useDebounce';

/************************************************************
 * useFilteredTransactions.ts
 * Vault - Memoized selector for filtered/sorted/paginated transactions.
 * - Filters by search, category, date range, and sorts by field/direction.
 * - Uses useMemo and useDebounce for performance.
 ************************************************************/

/**
 * useFilteredTransactions
 * - Returns filtered, sorted, and paginated transactions based on UI state.
 * - Filters: search query, category, date range.
 * - Sorts: by field (date, amount, category, etc.), direction.
 * - Pagination: optional (page, pageSize).
 * @param options Optional: { page, pageSize }
 * @returns {
 *   transactions: Transaction[],
 *   total: number,
 *   page: number,
 *   pageSize: number,
 *   totalPages: number,
 * }
 */
interface UseFilteredTransactionsOptions {
  page?: number;
  pageSize?: number;
}

interface UseFilteredTransactionsResult {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 20;

function normalizeString(str: string): string {
  return str.trim().toLowerCase();
}

export default function useFilteredTransactions(
  options: UseFilteredTransactionsOptions = {}
): UseFilteredTransactionsResult {
  // Finance data
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  // UI filters
  const searchQuery = useUIStore((state) => state.searchQuery);
  const filterCategoryId = useUIStore((state) => state.filterCategoryId);
  const filterDateRange = useUIStore((state) => state.filterDateRange);
  const sortField = useUIStore((state) => state.sortField);
  const sortDirection = useUIStore((state) => state.sortDirection);

  // Debounce search query for performance
  const debouncedSearch = useDebounce(searchQuery, 200);

  // Pagination
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  // Memoized filtered/sorted transactions
  const result = useMemo(() => {
    let filtered = transactions;

    // Filter by category
    if (!isEmpty(filterCategoryId)) {
      filtered = filtered.filter((tx) => tx.categoryId === filterCategoryId);
    }

    // Filter by date range
    if (
      filterDateRange &&
      filterDateRange.startDate &&
      filterDateRange.endDate
    ) {
      filtered = filterTransactionsByDateRange(filtered, filterDateRange);
    }

    // Filter by search query (debounced)
    if (!isEmpty(debouncedSearch)) {
      const q = normalizeString(debouncedSearch);
      filtered = filtered.filter((tx) => {
        // Search in description, notes, category name
        const category = categories.find((cat) => cat.id === tx.categoryId);
        const categoryName = category ? category.name : '';
        return (
          (tx.description && normalizeString(tx.description).includes(q)) ||
          (tx.notes && normalizeString(tx.notes).includes(q)) ||
          normalizeString(categoryName).includes(q)
        );
      });
    }

    // Sort transactions
    const sortFn = (a: Transaction, b: Transaction): number => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Special handling for date, amount, category
      if (sortField === 'date') {
        valA = a.date;
        valB = b.date;
        // Descending: newest first
        if (sortDirection === 'desc') {
          return valB.localeCompare(valA);
        } else {
          return valA.localeCompare(valB);
        }
      } else if (sortField === 'amount') {
        if (sortDirection === 'desc') {
          return valB - valA;
        } else {
          return valA - valB;
        }
      } else if (sortField === 'category') {
        const catA = categories.find((cat) => cat.id === a.categoryId)?.name || '';
        const catB = categories.find((cat) => cat.id === b.categoryId)?.name || '';
        if (sortDirection === 'desc') {
          return catB.localeCompare(catA);
        } else {
          return catA.localeCompare(catB);
        }
      } else {
        // Fallback: string comparison
        if (typeof valA === 'string' && typeof valB === 'string') {
          if (sortDirection === 'desc') {
            return valB.localeCompare(valA);
          } else {
            return valA.localeCompare(valB);
          }
        }
        // Fallback: numeric comparison
        if (typeof valA === 'number' && typeof valB === 'number') {
          if (sortDirection === 'desc') {
            return valB - valA;
          } else {
            return valA - valB;
          }
        }
        return 0;
      }
    };

    const sorted = [...filtered].sort(sortFn);

    // Pagination
    const total = sorted.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginated = sorted.slice(startIdx, endIdx);

    return {
      transactions: paginated,
      total,
      page: currentPage,
      pageSize,
      totalPages,
    };
  }, [
    transactions,
    categories,
    filterCategoryId,
    filterDateRange,
    debouncedSearch,
    sortField,
    sortDirection,
    page,
    pageSize,
  ]);

  return result;
}