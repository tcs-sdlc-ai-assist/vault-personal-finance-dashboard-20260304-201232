import React from 'react';
import { cn } from 'src/lib/utils';
import * as Icons from 'lucide-react';

/************************************************************
 * src/components/layout/NavItem.tsx
 * Vault - Sidebar/bottom nav item component.
 * - Renders an individual navigation item with icon, label, and active state.
 * - Handles accessibility, keyboard navigation, and click routing.
 ************************************************************/

/**
 * NavItemProps - Props for NavItem component.
 * @property icon Icon name from lucide-react (string)
 * @property label Display label for nav item
 * @property href Hash route (e.g., '#/dashboard')
 * @property active Whether this item is currently active
 * @property onClick Optional click handler (for custom navigation)
 * @property className Optional additional className
 * @property disabled Optional disabled state
 */
export interface NavItemProps {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * NavItem - Individual navigation item for sidebar/bottom nav.
 * - Renders icon, label, and active state.
 * - Handles accessibility and keyboard navigation.
 */
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  href,
  active = false,
  onClick,
  className,
  disabled = false,
}) => {
  // Resolve icon component from lucide-react
  const IconComponent =
    (Icons as Record<string, React.FC<{ size?: number; className?: string }>>)[icon] ||
    Icons.Circle;

  // Accessibility: aria-current for active, aria-disabled for disabled
  // Use <a> for navigation, <button> for actions (if onClick provided)
  const isButton = typeof onClick === 'function';

  const itemClass = cn(
    'flex items-center gap-xs px-md py-sm rounded-md font-medium transition-colors select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
    active
      ? 'bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand-dark'
      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800',
    disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
    className
  );

  // Handle click: prevent navigation if disabled
  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Render as button or anchor
  if (isButton) {
    return (
      <button
        type="button"
        className={itemClass}
        aria-current={active ? 'page' : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        disabled={disabled}
      >
        <IconComponent
          size={20}
          className={cn(
            'mr-sm',
            active ? 'text-brand' : 'text-neutral-400 dark:text-neutral-500'
          )}
          aria-hidden="true"
        />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      className={itemClass}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      role="link"
    >
      <IconComponent
        size={20}
        className={cn(
          'mr-sm',
          active ? 'text-brand' : 'text-neutral-400 dark:text-neutral-500'
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </a>
  );
};

export default NavItem;