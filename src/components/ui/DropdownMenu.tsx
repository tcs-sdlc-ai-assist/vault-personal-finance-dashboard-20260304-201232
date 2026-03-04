/************************************************************
 * src/components/ui/DropdownMenu.tsx
 * Vault - Accessible dropdown menu primitive.
 * - Wraps Radix UI DropdownMenu for actions, settings, and contextual menus.
 * - Provides composable API, keyboard navigation, focus management, and theming.
 * - Used throughout the app for action menus, filter menus, and settings.
 ************************************************************/

import React from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from 'src/lib/utils';
import { ChevronDown, Check, MoreVertical } from 'lucide-react';

/**
 * DropdownMenuRoot - Root container for dropdown menu.
 * @param children Menu trigger and content
 */
export const DropdownMenuRoot = RadixDropdownMenu.Root;

/**
 * DropdownMenuTrigger - Button or element that opens the menu.
 * @param props Standard button props
 */
export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <RadixDropdownMenu.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="ml-1 h-4 w-4 text-neutral-400" aria-hidden="true" />
  </RadixDropdownMenu.Trigger>
));
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

/**
 * DropdownMenuIconTrigger - Icon-only trigger (e.g., for action menus).
 * @param props Standard button props
 */
export const DropdownMenuIconTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <RadixDropdownMenu.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
      className
    )}
    aria-label="Open menu"
    {...props}
  >
    {children ?? <MoreVertical className="h-5 w-5 text-neutral-400" aria-hidden="true" />}
  </RadixDropdownMenu.Trigger>
));
DropdownMenuIconTrigger.displayName = 'DropdownMenuIconTrigger';

/**
 * DropdownMenuContent - Menu content container.
 * @param props Standard content props
 */
export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  RadixDropdownMenu.DropdownMenuContentProps
>(({ className, children, ...props }, ref) => (
  <RadixDropdownMenu.Content
    ref={ref}
    sideOffset={4}
    align="start"
    className={cn(
      'z-dropdown min-w-[180px] rounded-md bg-white dark:bg-neutral-900 shadow-lg border border-neutral-200 dark:border-neutral-700 py-2 px-1 animate-fadeIn',
      'focus:outline-none',
      className
    )}
    {...props}
  >
    {children}
  </RadixDropdownMenu.Content>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

/**
 * DropdownMenuItem - Menu item (button/action).
 * @param props Standard item props
 */
export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  RadixDropdownMenu.DropdownMenuItemProps & {
    icon?: React.ReactNode;
    shortcut?: string;
    selected?: boolean;
  }
>(({ className, children, icon, shortcut, selected, ...props }, ref) => (
  <RadixDropdownMenu.Item
    ref={ref}
    className={cn(
      'flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer select-none transition-colors',
      'text-neutral-700 dark:text-neutral-200',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-brand/15 focus-visible:ring-2 focus-visible:ring-brand',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4 text-neutral-400">{icon}</span>}
    <span className="flex-1">{children}</span>
    {selected && <Check className="ml-2 h-4 w-4 text-brand" aria-hidden="true" />}
    {shortcut && (
      <span className="ml-2 text-xs text-neutral-400 font-mono">{shortcut}</span>
    )}
  </RadixDropdownMenu.Item>
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

/**
 * DropdownMenuSeparator - Visual separator between items.
 */
export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  RadixDropdownMenu.DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Separator
    ref={ref}
    className={cn(
      'my-1 h-px bg-neutral-200 dark:bg-neutral-700',
      className
    )}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

/**
 * DropdownMenuLabel - Section label (non-interactive).
 */
export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  RadixDropdownMenu.DropdownMenuLabelProps
>(({ className, children, ...props }, ref) => (
  <RadixDropdownMenu.Label
    ref={ref}
    className={cn(
      'px-3 py-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500',
      className
    )}
    {...props}
  >
    {children}
  </RadixDropdownMenu.Label>
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

/**
 * DropdownMenuCheckboxItem - Checkbox menu item.
 * @param props Standard checkbox item props
 */
export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  RadixDropdownMenu.DropdownMenuCheckboxItemProps & {
    icon?: React.ReactNode;
    shortcut?: string;
  }
>(({ className, children, icon, checked, shortcut, ...props }, ref) => (
  <RadixDropdownMenu.CheckboxItem
    ref={ref}
    className={cn(
      'flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer select-none transition-colors',
      'text-neutral-700 dark:text-neutral-200',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-brand/15 focus-visible:ring-2 focus-visible:ring-brand',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    checked={checked}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4 text-neutral-400">{icon}</span>}
    <span className="flex-1">{children}</span>
    {checked && <Check className="ml-2 h-4 w-4 text-brand" aria-hidden="true" />}
    {shortcut && (
      <span className="ml-2 text-xs text-neutral-400 font-mono">{shortcut}</span>
    )}
  </RadixDropdownMenu.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

/**
 * DropdownMenuRadioGroup - Radio group container.
 */
export const DropdownMenuRadioGroup = RadixDropdownMenu.RadioGroup;

/**
 * DropdownMenuRadioItem - Radio menu item.
 * @param props Standard radio item props
 */
export const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  RadixDropdownMenu.DropdownMenuRadioItemProps & {
    icon?: React.ReactNode;
    shortcut?: string;
  }
>(({ className, children, icon, shortcut, ...props }, ref) => (
  <RadixDropdownMenu.RadioItem
    ref={ref}
    className={cn(
      'flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer select-none transition-colors',
      'text-neutral-700 dark:text-neutral-200',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'focus:bg-brand/15 focus-visible:ring-2 focus-visible:ring-brand',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  >
    {icon && <span className="mr-2 h-4 w-4 text-neutral-400">{icon}</span>}
    <span className="flex-1">{children}</span>
    {shortcut && (
      <span className="ml-2 text-xs text-neutral-400 font-mono">{shortcut}</span>
    )}
  </RadixDropdownMenu.RadioItem>
));
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

/**
 * DropdownMenuArrow - Optional arrow indicator for menu.
 */
export const DropdownMenuArrow = React.forwardRef<
  SVGSVGElement,
  RadixDropdownMenu.DropdownMenuArrowProps
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Arrow
    ref={ref}
    className={cn('fill-white dark:fill-neutral-900 drop-shadow-md', className)}
    {...props}
  />
));
DropdownMenuArrow.displayName = 'DropdownMenuArrow';

/**
 * DropdownMenu - Composite component for easy usage.
 * - Accepts trigger, items, and optional props.
 * - For advanced usage, use primitives above.
 */
export interface DropdownMenuProps {
  trigger?: React.ReactNode;
  items: Array<{
    label: React.ReactNode;
    icon?: React.ReactNode;
    shortcut?: string;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    type?: 'item' | 'checkbox' | 'radio' | 'separator' | 'label';
    checked?: boolean;
    value?: string;
  }>;
  radioGroupValue?: string;
  onRadioChange?: (value: string) => void;
  className?: string;
  align?: 'start' | 'end' | 'center';
  sideOffset?: number;
}

/**
 * DropdownMenu - High-level dropdown menu component.
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  radioGroupValue,
  onRadioChange,
  className,
  align = 'start',
  sideOffset = 4,
}) => (
  <DropdownMenuRoot>
    {trigger ? (
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
    ) : (
      <DropdownMenuIconTrigger />
    )}
    <DropdownMenuContent
      className={className}
      align={align}
      sideOffset={sideOffset}
    >
      {items.map((item, idx) => {
        switch (item.type) {
          case 'separator':
            return <DropdownMenuSeparator key={idx} />;
          case 'label':
            return (
              <DropdownMenuLabel key={idx}>
                {item.label}
              </DropdownMenuLabel>
            );
          case 'checkbox':
            return (
              <DropdownMenuCheckboxItem
                key={idx}
                icon={item.icon}
                shortcut={item.shortcut}
                checked={item.checked}
                disabled={item.disabled}
                onClick={item.onClick}
              >
                {item.label}
              </DropdownMenuCheckboxItem>
            );
          case 'radio':
            // Radio items must be wrapped in a RadioGroup
            // We'll render all radio items together if radioGroupValue is provided
            return null; // handled below
          default:
            // 'item'
            return (
              <DropdownMenuItem
                key={idx}
                icon={item.icon}
                shortcut={item.shortcut}
                disabled={item.disabled}
                selected={item.selected}
                onClick={item.onClick}
              >
                {item.label}
              </DropdownMenuItem>
            );
        }
      })}
      {/* Render radio group if any radio items exist */}
      {items.some((item) => item.type === 'radio') && (
        <DropdownMenuRadioGroup
          value={radioGroupValue}
          onValueChange={onRadioChange}
        >
          {items
            .filter((item) => item.type === 'radio')
            .map((item, idx) => (
              <DropdownMenuRadioItem
                key={`radio-${idx}`}
                value={item.value ?? String(idx)}
                icon={item.icon}
                shortcut={item.shortcut}
                disabled={item.disabled}
              >
                {item.label}
              </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      )}
      <DropdownMenuArrow />
    </DropdownMenuContent>
  </DropdownMenuRoot>
);

DropdownMenu.displayName = 'DropdownMenu';

/**
 * Export all primitives and composite for flexible usage.
 */
export default DropdownMenu;
export {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuIconTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuArrow,
};