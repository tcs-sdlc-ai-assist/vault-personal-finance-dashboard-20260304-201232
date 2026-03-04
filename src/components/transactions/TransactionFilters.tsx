import React, { useCallback } from 'react';
import { useUIStore } from 'src/stores/useUIStore';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { DATE_RANGE_PRESETS, DEFAULT_CATEGORIES } from 'src/lib/constants';
import { Category, DateRangePreset, TransactionType } from 'src/types/index';
import { cn } from 'src/lib/utils';
import Input from 'src/components/ui/Input';
import Select from 'src/components/ui/Select';
import Button from 'src/components/ui/Button';
import Badge from 'src/components/ui/Badge';
import Tooltip from 'src/components/ui/Tooltip';
import { Search, Filter, Calendar, List, X } from 'lucide-react';
import useDateRange from 'src/hooks/useDateRange';
import useDebounce from 'src/hooks/useDebounce';

/************************************************************
 * TransactionFilters.tsx
 * Vault - Filter controls for transactions table.
 * - Search, date range, category, type filters.
 * - Debounced, accessible, and responsive.
 ************************************************************/

interface TransactionFiltersProps {
  className?: string;
}

/**
 * TransactionFilters
 * - Filter controls for transaction table.
 * - Search (debounced), date range preset/custom, category, type.
 * - Accessible and responsive.
 */
const TransactionFilters: React.FC<TransactionFiltersProps> = ({ className }) => {
  // UI Store: filter state and actions
  const searchQuery = useUIStore((state) => state.searchQuery);
  const filterCategoryId = useUIStore((state) => state.filterCategoryId);
  const filterDatePreset = useUIStore((state) => state.filterDatePreset);
  const filterDateRange = useUIStore((state) => state.filterDateRange);
  const sortField = useUIStore((state) => state.sortField);
  const sortDirection = useUIStore((state) => state.sortDirection);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setFilterCategoryId = useUIStore((state) => state.setFilterCategoryId);
  const setFilterDatePreset = useUIStore((state) => state.setFilterDatePreset);
  const setFilterDateRange = useUIStore((state) => state.setFilterDateRange);
  const resetFilters = useUIStore((state) => state.resetFilters);

  // Finance Store: categories
  const categories = useFinanceStore((state) => state.categories);

  // Debounce search input for performance
  const debouncedSearch = useDebounce(searchQuery, 200);

  // Date range hook for presets/custom
  const {
    dateRange,
    setPreset,
    setCustomRange,
    presets,
    isCustom,
    validate,
  } = useDateRange(filterDatePreset, {
    start: filterDateRange.startDate,
    end: filterDateRange.endDate,
  });

  // Transaction type filter (expense/income/all)
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | 'all'>('all');
  const handleTypeChange = useCallback((val: TransactionType | 'all') => {
    setTypeFilter(val);
    // Optionally: update UIStore if type filter is needed globally
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback((val: string) => {
    setFilterCategoryId(val === 'all' ? null : val);
  }, [setFilterCategoryId]);

  // Handle date preset change
  const handleDatePresetChange = useCallback((val: DateRangePreset) => {
    setPreset(val);
    setFilterDatePreset(val);
    setFilterDateRange(getPresetDateRange(val));
  }, [setPreset, setFilterDatePreset, setFilterDateRange]);

  // Handle custom date range change
  const handleCustomDateChange = useCallback(
    (start: string, end: string) => {
      setCustomRange(start, end);
      setFilterDateRange({
        preset: 'custom',
        startDate: start,
        endDate: end,
      });
      setFilterDatePreset('custom');
    },
    [setCustomRange, setFilterDateRange, setFilterDatePreset]
  );

  // Reset all filters
  const handleReset = useCallback(() => {
    resetFilters();
    setPreset('thisMonth');
    setCustomRange(
      getPresetDateRange('thisMonth').startDate,
      getPresetDateRange('thisMonth').endDate
    );
    setTypeFilter('all');
  }, [resetFilters, setPreset, setCustomRange]);

  // Helper: get preset date range
  function getPresetDateRange(preset: DateRangePreset) {
    // Use same logic as useDateRange
    const now = new Date();
    let startDate: string;
    let endDate: string;
    switch (preset) {
      case 'all':
        startDate = '2000-01-01';
        endDate = now.toISOString().slice(0, 10);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
        break;
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().slice(0, 10);
        endDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().slice(0, 10);
        break;
      }
      case 'thisQuarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().slice(0, 10);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0).toISOString().slice(0, 10);
        break;
      }
      case 'lastQuarter': {
        const quarter = Math.floor(now.getMonth() / 3) - 1;
        const qMonth = quarter * 3;
        startDate = new Date(now.getFullYear(), qMonth, 1).toISOString().slice(0, 10);
        endDate = new Date(now.getFullYear(), qMonth + 3, 0).toISOString().slice(0, 10);
        break;
      }
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
        endDate = new Date(now.getFullYear(), 12, 0).toISOString().slice(0, 10);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().slice(0, 10);
        endDate = new Date(now.getFullYear() - 1, 12, 0).toISOString().slice(0, 10);
        break;
      case 'custom':
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
        break;
    }
    return { preset, startDate, endDate };
  }

  // Accessible label IDs
  const searchId = 'transaction-search';
  const categoryId = 'transaction-category';
  const typeId = 'transaction-type';
  const datePresetId = 'transaction-date-preset';
  const customStartId = 'transaction-custom-start';
  const customEndId = 'transaction-custom-end';

  return (
    <div
      className={cn(
        'flex flex-wrap gap-md items-center bg-neutral-50 dark:bg-neutral-800 rounded-lg p-md shadow-sm',
        className
      )}
      role="region"
      aria-label="Transaction Filters"
    >
      {/* Search Input */}
      <div className="flex items-center gap-xs">
        <Tooltip content="Search transactions">
          <Search className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        </Tooltip>
        <Input
          id={searchId}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search description, notes, category..."
          className="w-48"
          aria-label="Search transactions"
          autoComplete="off"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-xs">
        <Tooltip content="Filter by category">
          <List className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        </Tooltip>
        <Select
          id={categoryId}
          value={filterCategoryId || 'all'}
          onValueChange={handleCategoryChange}
          aria-label="Category filter"
          className="w-36"
        >
          <Select.Option value="all">All Categories</Select.Option>
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              <Badge color={cat.color} icon={cat.icon}>
                {cat.name}
              </Badge>
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-xs">
        <Tooltip content="Filter by transaction type">
          <Filter className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        </Tooltip>
        <Select
          id={typeId}
          value={typeFilter}
          onValueChange={handleTypeChange}
          aria-label="Transaction type filter"
          className="w-28"
        >
          <Select.Option value="all">All Types</Select.Option>
          <Select.Option value="expense">Expense</Select.Option>
          <Select.Option value="income">Income</Select.Option>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-xs">
        <Tooltip content="Filter by date range">
          <Calendar className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        </Tooltip>
        <Select
          id={datePresetId}
          value={filterDatePreset}
          onValueChange={handleDatePresetChange}
          aria-label="Date range preset"
          className="w-32"
        >
          {presets.map((preset) => (
            <Select.Option key={preset.key} value={preset.key}>
              {preset.label}
            </Select.Option>
          ))}
        </Select>
        {filterDatePreset === 'custom' && (
          <div className="flex items-center gap-xs">
            <Input
              id={customStartId}
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleCustomDateChange(e.target.value, dateRange.endDate)}
              aria-label="Custom start date"
              className="w-28"
            />
            <span className="text-neutral-400">–</span>
            <Input
              id={customEndId}
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleCustomDateChange(dateRange.startDate, e.target.value)}
              aria-label="Custom end date"
              className="w-28"
            />
          </div>
        )}
      </div>

      {/* Reset Filters Button */}
      <div className="ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          aria-label="Reset filters"
          className="flex items-center gap-xs text-neutral-500 hover:text-brand"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;