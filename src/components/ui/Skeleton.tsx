import React from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * src/components/ui/Skeleton.tsx
 * Vault - Skeleton loading component for async data and suspense states.
 * - Provides animated skeleton placeholder for loading UI.
 * - Supports shape, size, and custom className.
 * - Accessible: aria-busy, aria-label, role="status".
 ************************************************************/

/**
 * SkeletonProps
 * - shape: 'rect' | 'circle' | 'text' (default: 'rect')
 * - width, height: CSS size (string or number)
 * - className: additional Tailwind classes
 * - count: number of skeletons to render (default: 1)
 * - ariaLabel: accessibility label (default: 'Loading...')
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  ariaLabel?: string;
}

/**
 * Skeleton - Animated loading skeleton placeholder.
 * - Uses Tailwind classes for color, animation, and shape.
 * - Accessible for screen readers.
 */
const Skeleton: React.FC<SkeletonProps> = ({
  shape = 'rect',
  width,
  height,
  className,
  count = 1,
  ariaLabel = 'Loading...',
  ...rest
}) => {
  // Compute shape styles
  const shapeStyles = (() => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded-sm h-4';
      case 'rect':
      default:
        return 'rounded-md';
    }
  })();

  // Compute inline styles for width/height
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  // Render multiple skeletons if count > 1
  const skeletons = Array.from({ length: count }).map((_, idx) => (
    <div
      key={idx}
      className={cn(
        'bg-neutral-200 dark:bg-neutral-700 animate-pulse',
        shapeStyles,
        // Default sizing for text skeleton
        shape === 'text' && !height ? 'h-4' : '',
        className
      )}
      style={style}
      aria-busy="true"
      aria-label={ariaLabel}
      role="status"
      {...rest}
    />
  ));

  // If count === 1, return single skeleton, else wrap in fragment
  return count === 1 ? skeletons[0] : <>{skeletons}</>;
};

export default Skeleton;