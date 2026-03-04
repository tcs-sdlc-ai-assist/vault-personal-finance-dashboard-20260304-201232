import React from 'react';
import { cn } from 'src/lib/utils';
import AnimatedNumber from 'src/components/ui/AnimatedNumber';
import PercentageBadge from 'src/components/ui/PercentageBadge';
import CurrencyDisplay from 'src/components/ui/CurrencyDisplay';
import { formatNumber, formatCurrency } from 'src/lib/formatters';
import { LucideIcon } from 'lucide-react';
import { useCurrency } from 'src/hooks/useCurrency';
import { useMediaQuery } from 'src/hooks/useMediaQuery';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

/************************************************************
 * KPICard.tsx
 * Vault - KPI card component for dashboard analytics.
 * - Displays animated number, MoM comparison, and mini sparkline.
 * - Used in dashboard top row for income, expense, net, etc.
 ************************************************************/

/**
 * KPICardProps
 * - label: KPI label (e.g., "Total Income")
 * - value: KPI value (number)
 * - prevValue: Previous period value (for MoM comparison)
 * - icon: Optional Lucide icon (for visual context)
 * - color: Optional color (theme key or hex)
 * - currency: Optional currency code (for currency KPIs)
 * - sparklineData: Array of numbers for mini sparkline (optional)
 * - valueType: 'currency' | 'number' | 'percent' (default: 'number')
 * - className: Optional custom className
 */
export interface KPICardProps {
  label: string;
  value: number;
  prevValue?: number;
  icon?: LucideIcon;
  color?: string;
  currency?: string;
  sparklineData?: number[];
  valueType?: 'currency' | 'number' | 'percent';
  className?: string;
}

/**
 * KPICard - Dashboard KPI card with animated number, MoM badge, and sparkline.
 */
const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  prevValue,
  icon: Icon,
  color,
  currency,
  sparklineData,
  valueType = 'number',
  className,
}) => {
  // Currency formatting
  const { format: currencyFormat, symbol } = useCurrency(currency);

  // Responsive: show sparkline only on md+
  const { isMd } = useMediaQuery();

  // Calculate MoM percentage change
  let percentChange: number | null = null;
  if (
    typeof prevValue === 'number' &&
    prevValue !== 0 &&
    typeof value === 'number'
  ) {
    percentChange = ((value - prevValue) / Math.abs(prevValue)) * 100;
  } else if (
    typeof prevValue === 'number' &&
    prevValue === 0 &&
    typeof value === 'number'
  ) {
    percentChange = value === 0 ? 0 : 100;
  }

  // Value display
  let valueDisplay: React.ReactNode;
  switch (valueType) {
    case 'currency':
      valueDisplay = (
        <CurrencyDisplay
          value={value}
          currency={currency}
          animated
          className="text-2xl md:text-3xl font-bold"
        />
      );
      break;
    case 'percent':
      valueDisplay = (
        <AnimatedNumber
          value={value}
          decimals={2}
          className="text-2xl md:text-3xl font-bold"
          suffix="%"
        />
      );
      break;
    case 'number':
    default:
      valueDisplay = (
        <AnimatedNumber
          value={value}
          decimals={2}
          className="text-2xl md:text-3xl font-bold"
        />
      );
      break;
  }

  // Card color
  const cardColor =
    color ||
    (valueType === 'currency'
      ? 'brand'
      : valueType === 'percent'
      ? 'success'
      : 'neutral-100');

  // Sparkline chart data
  const sparklineChartData =
    sparklineData && sparklineData.length > 0
      ? sparklineData.map((v, i) => ({ idx: i, value: v }))
      : null;

  return (
    <div
      className={cn(
        'glass shadow-md rounded-lg p-4 flex flex-col gap-2 relative min-w-[140px] md:min-w-[180px] transition-colors',
        className
      )}
      style={
        cardColor && cardColor.startsWith('#')
          ? { borderLeft: `4px solid ${cardColor}` }
          : cardColor
          ? { borderLeft: `4px solid var(--color-${cardColor})` }
          : undefined
      }
      aria-label={label}
    >
      {/* Icon and label */}
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <Icon
            size={22}
            className={cn(
              'text-brand',
              cardColor && cardColor.startsWith('#')
                ? ''
                : `text-${cardColor}`
            )}
            aria-hidden="true"
          />
        )}
        <span className="text-sm md:text-base font-medium text-neutral-500 dark:text-neutral-300 truncate">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2">
        {valueDisplay}
        {/* MoM badge */}
        {percentChange !== null && (
          <PercentageBadge
            value={percentChange}
            className="ml-2"
            showArrow
          />
        )}
      </div>

      {/* Sparkline */}
      {isMd && sparklineChartData && (
        <div className="absolute bottom-2 right-2 w-[60px] h-[24px] pointer-events-none opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineChartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  cardColor && cardColor.startsWith('#')
                    ? cardColor
                    : `var(--color-${cardColor})`
                }
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default KPICard;