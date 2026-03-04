import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears } from 'date-fns';
import { DateRangePreset, DateRange } from 'src/types/index';
import { DATE_RANGE_PRESETS } from 'src/lib/constants';

/************************************************************
 * useDateRange.ts
 * Vault - Custom hook for date range preset and custom range logic.
 * - Handles dashboard/filter presets (this month, last month, etc.)
 * - Supports custom date range selection and validation.
 * - Used in filters, dashboards, and analytics.
 ************************************************************/

/**
 * getPresetDateRange
 * - Returns a DateRange object for a given preset.
 * @param preset DateRangePreset
 * @returns DateRange
 */
function getPresetDateRange(preset: DateRangePreset): DateRange {
  const now = new Date();
  let startDate: string;
  let endDate: string;

  switch (preset) {
    case 'all':
      // All time: arbitrarily wide range
      startDate = '2000-01-01';
      endDate = format(now, 'yyyy-MM-dd');
      break;
    case 'thisMonth':
      startDate = format(startOfMonth(now), 'yyyy-MM-dd');
      endDate = format(endOfMonth(now), 'yyyy-MM-dd');
      break;
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
      endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
      break;
    }
    case 'thisQuarter':
      startDate = format(startOfQuarter(now), 'yyyy-MM-dd');
      endDate = format(endOfQuarter(now), 'yyyy-MM-dd');
      break;
    case 'lastQuarter': {
      const lastQuarter = subQuarters(now, 1);
      startDate = format(startOfQuarter(lastQuarter), 'yyyy-MM-dd');
      endDate = format(endOfQuarter(lastQuarter), 'yyyy-MM-dd');
      break;
    }
    case 'thisYear':
      startDate = format(startOfYear(now), 'yyyy-MM-dd');
      endDate = format(endOfYear(now), 'yyyy-MM-dd');
      break;
    case 'lastYear': {
      const lastYear = subYears(now, 1);
      startDate = format(startOfYear(lastYear), 'yyyy-MM-dd');
      endDate = format(endOfYear(lastYear), 'yyyy-MM-dd');
      break;
    }
    case 'custom':
      // Custom: caller must provide start/end
      startDate = format(now, 'yyyy-MM-dd');
      endDate = format(now, 'yyyy-MM-dd');
      break;
    default:
      // Fallback: this month
      startDate = format(startOfMonth(now), 'yyyy-MM-dd');
      endDate = format(endOfMonth(now), 'yyyy-MM-dd');
      break;
  }

  return {
    preset,
    startDate,
    endDate,
  };
}

/**
 * useDateRange
 * - Manages date range preset and custom range selection.
 * - Returns current range, setter, preset setter, and validation.
 * @param initialPreset Optional initial preset (default: 'thisMonth')
 * @param initialCustomRange Optional initial custom range (start/end)
 * @returns {
 *   dateRange: DateRange,
 *   setPreset: (preset: DateRangePreset) => void,
 *   setCustomRange: (start: string, end: string) => void,
 *   presets: typeof DATE_RANGE_PRESETS,
 *   isCustom: boolean,
 *   validate: () => boolean,
 * }
 */
export default function useDateRange(
  initialPreset: DateRangePreset = 'thisMonth',
  initialCustomRange?: { start: string; end: string }
) {
  // State: preset and date range
  const [preset, setPreset] = useState<DateRangePreset>(initialPreset);
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>(
    initialCustomRange || {
      start: getPresetDateRange('thisMonth').startDate,
      end: getPresetDateRange('thisMonth').endDate,
    }
  );

  // Compute dateRange based on preset/custom
  const dateRange: DateRange = (() => {
    if (preset === 'custom') {
      return {
        preset,
        startDate: customRange.start,
        endDate: customRange.end,
      };
    }
    return getPresetDateRange(preset);
  })();

  // Setter for preset (resets custom range if not custom)
  const handleSetPreset = useCallback((newPreset: DateRangePreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      // Reset custom range to preset's range
      const presetRange = getPresetDateRange(newPreset);
      setCustomRange({
        start: presetRange.startDate,
        end: presetRange.endDate,
      });
    }
  }, []);

  // Setter for custom range (only affects if preset is 'custom')
  const handleSetCustomRange = useCallback((start: string, end: string) => {
    setPreset('custom');
    setCustomRange({ start, end });
  }, []);

  // Validation: start <= end, both valid YYYY-MM-DD
  const validate = useCallback(() => {
    const { startDate, endDate } = dateRange;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return false;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }, [dateRange]);

  // isCustom flag
  const isCustom = preset === 'custom';

  // Expose presets for UI
  const presets = DATE_RANGE_PRESETS;

  return {
    dateRange,
    setPreset: handleSetPreset,
    setCustomRange: handleSetCustomRange,
    presets,
    isCustom,
    validate,
  };
}