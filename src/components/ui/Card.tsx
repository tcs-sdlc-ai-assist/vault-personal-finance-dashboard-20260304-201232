import React from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * src/components/ui/Card.tsx
 * Vault - Reusable Card container for dashboard panels, widgets, and sections.
 * - Supports frosted glass, gradient backgrounds, shadow, and custom content.
 * - Fully accessible, responsive, and composable.
 ************************************************************/

/**
 * CardProps
 * - children: Card content
 * - className: Additional Tailwind classes
 * - variant: 'default' | 'glass' | 'gradient-blue-pink' | 'gradient-green-yellow' | 'gradient-purple-orange'
 * - shadow: 'sm' | 'md' | 'lg' | 'xl' | 'glass' | 'none'
 * - as: Custom element type (default: 'div')
 * - ariaLabel: Optional ARIA label for accessibility
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient-blue-pink' | 'gradient-green-yellow' | 'gradient-purple-orange';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'glass' | 'none';
  as?: React.ElementType;
  ariaLabel?: string;
}

/**
 * Card
 * - Reusable container for dashboard widgets, panels, and sections.
 * - Supports frosted glass, gradients, and custom shadows.
 * - Responsive and accessible.
 */
const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  shadow = 'md',
  as: Component = 'div',
  ariaLabel,
  ...rest
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-white dark:bg-neutral-800',
    glass: 'glass',
    'gradient-blue-pink': 'bg-gradient-blue-pink text-white',
    'gradient-green-yellow': 'bg-gradient-green-yellow text-neutral-900',
    'gradient-purple-orange': 'bg-gradient-purple-orange text-white',
  };

  // Shadow styles
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    glass: 'shadow-glass',
    none: '',
  };

  // Card base styles
  const baseClasses =
    'rounded-lg p-4 md:p-6 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand';

  // Compose final className
  const cardClassName = cn(
    baseClasses,
    variantClasses[variant],
    shadowClasses[shadow],
    className
  );

  return (
    <Component
      className={cardClassName}
      aria-label={ariaLabel}
      tabIndex={0}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Card;