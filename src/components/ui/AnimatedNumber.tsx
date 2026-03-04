import React, { useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { cn } from 'src/lib/utils';

/************************************************************
 * AnimatedNumber.tsx
 * Vault - Animated number component for KPIs and charts.
 * - Animates count-up/down transitions for numeric values.
 * - Uses react-spring for smooth, performant animation.
 * - Supports formatting, decimals, prefix/suffix, and accessibility.
 ************************************************************/

/**
 * AnimatedNumberProps
 * - value: number to animate to
 * - decimals: number of decimal places (default: 2)
 * - duration: animation duration in ms (default: 800)
 * - format: optional formatter function (value: number) => string
 * - prefix: optional string before number
 * - suffix: optional string after number
 * - className: optional Tailwind classes
 * - ariaLabel: optional accessibility label
 */
export interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  format?: (value: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * AnimatedNumber
 * - Animates numeric value transitions for KPIs and charts.
 * - Uses react-spring for smooth count-up/down.
 * - Handles formatting, decimals, prefix/suffix.
 * - Accessible: aria-label for screen readers.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 2,
  duration = 800,
  format,
  prefix = '',
  suffix = '',
  className,
  ariaLabel,
}) => {
  // Store previous value for spring animation
  const prevValueRef = useRef<number>(value);

  // react-spring animation
  const [spring, api] = useSpring(() => ({
    from: { number: value },
    to: { number: value },
    config: { duration },
    reset: true,
  }));

  // Update animation when value changes
  useEffect(() => {
    api.start({
      from: { number: prevValueRef.current },
      to: { number: value },
      config: { duration },
      reset: false,
    });
    prevValueRef.current = value;
  }, [value, duration, api]);

  // Format number for display
  const renderValue = (num: number) => {
    if (format) return format(num);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Accessibility: aria-label (default: formatted value)
  const accessibleLabel =
    ariaLabel ||
    `${prefix}${renderValue(value)}${suffix}`;

  return (
    <animated.span
      className={cn(
        'font-heading font-bold text-2xl md:text-3xl transition-colors',
        className
      )}
      aria-label={accessibleLabel}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}
      {/* spring.number is animated value */}
      {spring.number.to((num) => renderValue(num))}
      {suffix}
    </animated.span>
  );
};

export default AnimatedNumber;