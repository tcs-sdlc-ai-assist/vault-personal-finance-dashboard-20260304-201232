import React from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * Badge.tsx
 * Vault - Reusable badge component for category/status display.
 * - Supports color, icon, size, and status variants.
 * - Used for category labels, status tags, and analytics.
 ************************************************************/

/**
 * BadgeProps
 * - label: string (required)
 * - color: theme key or hex (optional, defaults to neutral)
 * - icon: lucide-react icon name (optional)
 * - size: 'sm' | 'md' | 'lg' (optional, default: 'md')
 * - variant: 'solid' | 'outline' | 'subtle' (optional, default: 'solid')
 * - className: additional classes (optional)
 * - children: optional custom content (overrides label)
 */
export interface BadgeProps {
  label?: string;
  color?: string; // theme key (e.g., 'category.groceries') or hex
  icon?: string; // lucide-react icon name
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'subtle';
  className?: string;
  children?: React.ReactNode;
  // For status badges
  status?: 'success' | 'warning' | 'error' | 'info';
  // For accessibility
  'aria-label'?: string;
}

// Icon loader (lucide-react dynamic import)
function LucideIcon({ name, className }: { name: string; className?: string }) {
  // Dynamic import for lucide icons
  const [Icon, setIcon] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (name) {
      import('lucide-react')
        .then((mod) => {
          if (mounted && typeof mod[name] === 'function') {
            setIcon(() => mod[name]);
          }
        })
        .catch(() => {
          setIcon(null);
        });
    }
    return () => {
      mounted = false;
    };
  }, [name]);

  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}

// Color resolver: theme key or hex
function resolveColor(color?: string, status?: BadgeProps['status'], variant?: BadgeProps['variant']) {
  // Status color mapping
  const statusMap: Record<string, string> = {
    success: 'bg-success text-white border-success',
    warning: 'bg-warning text-neutral-900 border-warning',
    error: 'bg-error text-white border-error',
    info: 'bg-info text-white border-info',
  };
  const statusOutlineMap: Record<string, string> = {
    success: 'border-success text-success bg-transparent',
    warning: 'border-warning text-warning bg-transparent',
    error: 'border-error text-error bg-transparent',
    info: 'border-info text-info bg-transparent',
  };
  const statusSubtleMap: Record<string, string> = {
    success: 'bg-success/15 text-success border-transparent',
    warning: 'bg-warning/15 text-warning border-transparent',
    error: 'bg-error/15 text-error border-transparent',
    info: 'bg-info/15 text-info border-transparent',
  };

  if (status && variant === 'solid') return statusMap[status];
  if (status && variant === 'outline') return statusOutlineMap[status];
  if (status && variant === 'subtle') return statusSubtleMap[status];

  // Category color mapping
  if (color) {
    // If theme key (e.g., 'category.groceries'), use Tailwind class
    if (/^[a-zA-Z.]+$/.test(color)) {
      if (variant === 'solid')
        return `bg-${color} text-white border-${color}`;
      if (variant === 'outline')
        return `border-${color} text-${color} bg-transparent`;
      if (variant === 'subtle')
        return `bg-${color}/15 text-${color} border-transparent`;
    }
    // If hex, use inline style
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      if (variant === 'solid')
        return '';
      if (variant === 'outline')
        return '';
      if (variant === 'subtle')
        return '';
    }
  }
  // Default neutral
  if (variant === 'solid')
    return 'bg-neutral-200 text-neutral-700 border-neutral-200';
  if (variant === 'outline')
    return 'border-neutral-400 text-neutral-700 bg-transparent';
  if (variant === 'subtle')
    return 'bg-neutral-100 text-neutral-700 border-transparent';
  return '';
}

// Inline style for hex color
function getInlineStyle(color?: string, variant?: BadgeProps['variant']) {
  if (!color) return undefined;
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    if (variant === 'solid') {
      return { backgroundColor: color, color: '#fff', borderColor: color };
    }
    if (variant === 'outline') {
      return { borderColor: color, color: color, backgroundColor: 'transparent' };
    }
    if (variant === 'subtle') {
      return { backgroundColor: `${color}26`, color: color, borderColor: 'transparent' }; // 15% opacity
    }
  }
  return undefined;
}

/**
 * Badge - Reusable badge for category/status display.
 */
const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  icon,
  size = 'md',
  variant = 'solid',
  className,
  children,
  status,
  'aria-label': ariaLabel,
}) => {
  // Size mapping
  const sizeMap: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs rounded-sm gap-1',
    md: 'px-3 py-1 text-sm rounded-md gap-1.5',
    lg: 'px-4 py-1.5 text-base rounded-lg gap-2',
  };

  // Icon size mapping
  const iconSizeMap: Record<string, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Color classes
  const colorClasses = resolveColor(color, status, variant);

  // Inline style for hex color
  const inlineStyle = getInlineStyle(color, variant);

  // Accessibility label
  const aria = ariaLabel || label || (typeof children === 'string' ? children : undefined);

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        sizeMap[size],
        colorClasses,
        className
      )}
      style={inlineStyle}
      aria-label={aria}
      role="status"
    >
      {icon && (
        <LucideIcon
          name={icon}
          className={cn(iconSizeMap[size], 'mr-1')}
        />
      )}
      {children ?? label}
    </span>
  );
};

export default Badge;