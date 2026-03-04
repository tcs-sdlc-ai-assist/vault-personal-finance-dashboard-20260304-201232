import React from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * ProgressBar.tsx
 * Vault - Animated progress bar component for budgets, goals, storage.
 * - Supports color thresholds, gradients, and accessibility.
 * - Used in budget widgets, savings goals, storage quota indicator, etc.
 ************************************************************/

/**
 * ProgressBarProps
 * - value: progress value (0-100)
 * - label: optional label (for accessibility)
 * - color: theme color key or hex (default: brand)
 * - thresholds: optional array of { value, color } for dynamic color
 * - showValue: show numeric value as text
 * - size: 'sm' | 'md' | 'lg' (height)
 * - className: additional className
 * - gradient: optional gradient background (theme key)
 */
export interface ProgressBarProps {
  value: number; // 0-100 (percent)
  label?: string;
  color?: string;
  thresholds?: { value: number; color: string }[];
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  gradient?: string;
}

/**
 * Get color based on thresholds.
 * - If thresholds provided, use the color for the highest threshold <= value.
 * - Otherwise, use provided color or default.
 */
function getProgressColor(
  value: number,
  color?: string,
  thresholds?: { value: number; color: string }[],
  gradient?: string
): string {
  if (gradient) return gradient;
  if (thresholds && thresholds.length > 0) {
    // Sort thresholds ascending
    const sorted = [...thresholds].sort((a, b) => a.value - b.value);
    let matched = sorted[0].color;
    for (const t of sorted) {
      if (value >= t.value) matched = t.color;
      else break;
    }
    return matched;
  }
  return color || 'brand';
}

/**
 * ProgressBar
 * - Animated progress bar with color thresholds and accessibility.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color,
  thresholds,
  showValue = false,
  size = 'md',
  className,
  gradient,
}) => {
  // Clamp value between 0 and 100
  const percent = Math.max(0, Math.min(100, value));

  // Determine color/gradient
  const progressColor = getProgressColor(percent, color, thresholds, gradient);

  // Size map (height)
  const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-5',
  };

  // Accessible label
  const ariaLabel = label || 'Progress';

  // Progress bar styles
  const barBgClass = 'bg-neutral-200 dark:bg-neutral-700';
  const barRadiusClass = 'rounded-full';
  const barShadowClass = 'shadow-sm';

  // Progress fill styles
  let fillStyle: React.CSSProperties = {};
  let fillClass = '';

  if (progressColor.startsWith('linear-gradient')) {
    // Gradient as inline style
    fillStyle.background = progressColor;
  } else if (progressColor.startsWith('#')) {
    fillStyle.backgroundColor = progressColor;
  } else {
    // Assume theme color key (e.g., 'brand', 'success', etc.)
    fillClass = `bg-${progressColor}`;
  }

  // Animation: width transition
  const transitionClass = 'transition-all duration-500 ease-out';

  return (
    <div
      className={cn(
        'relative w-full',
        barBgClass,
        barRadiusClass,
        barShadowClass,
        sizeMap[size],
        className
      )}
      aria-label={ariaLabel}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      {/* Progress fill */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0',
          barRadiusClass,
          transitionClass,
          fillClass
        )}
        style={{
          width: `${percent}%`,
          ...fillStyle,
        }}
      />
      {/* Value label (optional) */}
      {showValue && (
        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium',
            percent < 90 ? 'text-neutral-700 dark:text-neutral-200' : 'text-white'
          )}
          aria-live="polite"
        >
          {`${percent.toFixed(0)}%`}
        </div>
      )}
      {/* Accessible fallback label (visually hidden) */}
      {label && (
        <span className="sr-only">{`${label}: ${percent.toFixed(0)}%`}</span>
      )}
    </div>
  );
};

export default ProgressBar;