import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from 'src/lib/utils';

/************************************************************
 * src/components/ui/Tooltip.tsx
 * Vault - Accessible tooltip primitive.
 * - Wraps Radix UI Tooltip for consistent, accessible tooltips.
 * - Used for icons, buttons, chart details, and more.
 * - Supports custom content, delay, placement, and styling.
 ************************************************************/

/**
 * TooltipProps
 * - content: Tooltip text or JSX
 * - children: Element to wrap (must be a single React element)
 * - side: Placement ('top', 'right', 'bottom', 'left')
 * - align: Alignment ('start', 'center', 'end')
 * - delay: Show delay in ms (default: 150)
 * - className: Custom class for tooltip content
 * - disabled: If true, disables tooltip
 */
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Tooltip - Accessible tooltip primitive.
 * - Uses Radix UI Tooltip for a11y and positioning.
 * - Custom styling for Vault theme.
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 150,
  className,
  disabled = false,
}) => {
  // If disabled or no content, render children without tooltip
  if (disabled || !content) {
    return children;
  }

  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={delay}>
        <RadixTooltip.Trigger asChild>
          {/* Ensure child is focusable for accessibility */}
          {React.cloneElement(children, {
            tabIndex: children.props.tabIndex ?? 0,
            'aria-describedby': content ? undefined : undefined,
          })}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            className={cn(
              'z-tooltip px-3 py-2 rounded-md text-sm font-medium bg-neutral-800 text-neutral-50 shadow-lg max-w-xs select-none animate-fadeIn',
              'border border-neutral-700',
              'dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800',
              className
            )}
            sideOffset={8}
            aria-live="polite"
          >
            {content}
            <RadixTooltip.Arrow
              className={cn(
                'fill-neutral-800 dark:fill-neutral-900 drop-shadow-md'
              )}
              width={12}
              height={6}
            />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;