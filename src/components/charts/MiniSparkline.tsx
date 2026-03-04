import React, { useMemo } from 'react';
import { cn } from 'src/lib/utils';

/************************************************************
 * MiniSparkline.tsx
 * Vault - Tiny inline SVG sparkline for KPI cards.
 * - Animated, color-coded, accessible.
 * - Used for trend visualization in dashboard KPIs.
 ************************************************************/

/**
 * MiniSparklineProps
 * - data: Array of numbers (trend values)
 * - width: SVG width (default: 64)
 * - height: SVG height (default: 24)
 * - color: Stroke color (default: brand blue)
 * - fill: Fill color under curve (optional)
 * - className: Additional classnames
 * - animate: Enable line animation (default: true)
 * - ariaLabel: Accessible label for screen readers
 */
export interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  className?: string;
  animate?: boolean;
  ariaLabel?: string;
}

/**
 * MiniSparkline
 * - Renders a tiny SVG sparkline for KPI trends.
 * - Animates line drawing for visual feedback.
 * - Color-coded for status (brand, success, error, etc.).
 */
const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  width = 64,
  height = 24,
  color = 'var(--color-brand, #3B82F6)',
  fill,
  className,
  animate = true,
  ariaLabel = 'Trend sparkline',
}) => {
  // Early return for empty data
  if (!Array.isArray(data) || data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        aria-label={ariaLabel}
        role="img"
        className={cn('inline-block', className)}
      >
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
        />
      </svg>
    );
  }

  // Memoize min/max for scaling
  const { min, max } = useMemo(() => {
    let min = data[0];
    let max = data[0];
    for (const v of data) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    // Avoid zero range
    if (min === max) {
      min -= 1;
      max += 1;
    }
    return { min, max };
  }, [data]);

  // Map data to SVG points
  const points = useMemo(() => {
    const len = data.length;
    return data.map((v, i) => {
      // X: evenly spaced across width
      const x = (i / (len - 1)) * width;
      // Y: invert, scale to height (min at bottom, max at top)
      const y =
        height -
        ((v - min) / (max - min)) * (height - 4) -
        2; // Padding top/bottom
      return { x, y };
    });
  }, [data, width, height, min, max]);

  // Build SVG path for line
  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    return path;
  }, [points]);

  // Build SVG path for fill (area under curve)
  const fillPath = useMemo(() => {
    if (!fill || points.length < 2) return '';
    let path = `M ${points[0].x.toFixed(2)} ${height}`;
    for (let i = 0; i < points.length; i++) {
      path += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    path += ` L ${points[points.length - 1].x.toFixed(2)} ${height}`;
    path += ' Z';
    return path;
  }, [points, height, fill]);

  // Animation: stroke-dasharray for line drawing
  const [pathLength, setPathLength] = React.useState(0);
  const lineRef = React.useRef<SVGPathElement>(null);

  React.useEffect(() => {
    if (lineRef.current) {
      setPathLength(lineRef.current.getTotalLength());
    }
  }, [linePath]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label={ariaLabel}
      role="img"
      className={cn('inline-block', className)}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      tabIndex={-1}
    >
      {/* Fill under curve */}
      {fill && fillPath && (
        <path
          d={fillPath}
          fill={fill}
          opacity={0.18}
        />
      )}

      {/* Sparkline curve */}
      <path
        ref={lineRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={
          animate && pathLength > 0
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                animation: `sparkline-draw 0.8s cubic-bezier(0.4,0,0.2,1) forwards`,
              }
            : undefined
        }
      />

      {/* Optionally highlight last point */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        fill={color}
        opacity={0.7}
      />

      {/* CSS animation for line drawing */}
      <style>
        {`
          @keyframes sparkline-draw {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </svg>
  );
};

export default MiniSparkline;