import React from 'react';
import { cn } from 'src/lib/utils';
import { DATE_RANGE_PRESETS } from 'src/lib/constants';
import { formatDate } from 'src/lib/formatters';
import { DateRangePreset, DateRange } from 'src/types/index';
import Button from 'src/components/ui/Button';
import DropdownMenu from 'src/components/ui/DropdownMenu';
import Tooltip from 'src/components/ui/Tooltip';
import Input from 'src/components/ui/Input';
import { useUIStore } from 'src/stores/useUIStore';
import useDateRange from 'src/hooks/useDateRange';
import { CalendarDays, Filter, Plus, RefreshCcw } from 'lucide-react';

/************************************************************
 * PageHeader.tsx
 * Vault - Page header with title, date range picker, and action buttons.
 * - Used on all main pages (Dashboard, Transactions, Budgets, Categories, etc.)
 * - Provides consistent layout, controls, and filters.
 ************************************************************/

/**
 * PageHeaderProps
 * - title: Page title (string)
 * - subtitle: Optional subtitle (string)
 * - showDateRange: Show date range picker (default: true)
 * - showSearch: Show search input (default: false)
 * - actions: Array of action button configs
 * - children: Optional custom controls (rendered right side)
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showDateRange?: boolean;
  showSearch?: boolean;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    tooltip?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
    testId?: string;
  }>;
  children?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader - Page header with controls and filters.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showDateRange = true,
  showSearch = false,
  actions = [],
  children,
  className,
}) => {
  // UI store for filters/search
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);

  const filterDatePreset = useUIStore((state) => state.filterDatePreset);
  const setFilterDatePreset = useUIStore((state) => state.setFilterDatePreset);
  const filterDateRange = useUIStore((state) => state.filterDateRange);
  const setFilterDateRange = useUIStore((state) => state.setFilterDateRange);

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

  // Handle preset change
  const handlePresetChange = (preset: DateRangePreset) => {
    setPreset(preset);
    setFilterDatePreset(preset);
    setFilterDateRange({
      preset,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  // Handle custom range change
  const handleCustomRangeChange = (start: string, end: string) => {
    setCustomRange(start, end);
    setFilterDatePreset('custom');
    setFilterDateRange({
      preset: 'custom',
      startDate: start,
      endDate: end,
    });
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Date range picker UI
  const renderDateRangePicker = () => (
    <DropdownMenu
      trigger={
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
          aria-label="Select date range"
        >
          <CalendarDays className="w-4 h-4" />
          <span>
            {
              presets.find((p) => p.key === dateRange.preset)?.label ||
              'Date Range'
            }
          </span>
        </Button>
      }
      menuClassName="w-64"
    >
      {/* Preset options */}
      <div className="px-2 py-1">
        {presets.map((preset) => (
          <DropdownMenu.Item
            key={preset.key}
            onSelect={() => handlePresetChange(preset.key)}
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded cursor-pointer',
              dateRange.preset === preset.key
                ? 'bg-brand/10 text-brand font-semibold'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
            aria-selected={dateRange.preset === preset.key}
          >
            {preset.key === 'custom' ? <Filter className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
            <span>{preset.label}</span>
          </DropdownMenu.Item>
        ))}
      </div>
      {/* Custom range inputs */}
      {dateRange.preset === 'custom' && (
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Custom Range
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleCustomRangeChange(e.target.value, dateRange.endDate)
                }
                className="w-1/2"
                aria-label="Start date"
                min="2000-01-01"
                max={dateRange.endDate}
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleCustomRangeChange(dateRange.startDate, e.target.value)
                }
                className="w-1/2"
                aria-label="End date"
                min={dateRange.startDate}
                max={formatDate(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            {!validate() && (
              <span className="text-xs text-error mt-1">
                Invalid date range.
              </span>
            )}
          </div>
        </div>
      )}
    </DropdownMenu>
  );

  // Search input UI
  const renderSearchInput = () => (
    <Input
      type="search"
      value={searchQuery}
      onChange={handleSearchChange}
      placeholder="Search..."
      className="w-48"
      aria-label="Search"
      autoComplete="off"
    />
  );

  // Action buttons UI
  const renderActions = () =>
    actions.map((action, idx) => (
      <Tooltip key={idx} content={action.tooltip || action.label}>
        <Button
          variant={action.variant || 'primary'}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          data-testid={action.testId}
          className="flex items-center gap-2"
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      </Tooltip>
    ));

  return (
    <header
      className={cn(
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6',
        className
      )}
      aria-label="Page header"
    >
      {/* Left: Title and subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-heading font-bold text-neutral-900 dark:text-neutral-50">
          {title}
        </h1>
        {subtitle && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {showDateRange && renderDateRangePicker()}
        {showSearch && renderSearchInput()}
        {renderActions()}
        {children}
      </div>
    </header>
  );
};

export default PageHeader;