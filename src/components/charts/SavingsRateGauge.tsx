import React from 'react';
import { useFinanceStore } from 'src/stores/useFinanceStore';
import { useUIStore } from 'src/stores/useUIStore';
import { formatPercentage } from 'src/lib/formatters';
import { cn } from 'src/lib/utils';

/************************************************************
 * SavingsRateGauge.tsx
 * Vault - Semi-circular gauge chart for savings rate analytics.
 * - Displays savings rate as a percentage (income saved vs. total income).
 * - Animated needle, color-coded zones, accessible label.
 * - Used in analytics page/dashboard.
 ************************************************************/

/**
 * Props for SavingsRateGauge
 * - savingsRate: number (0-100, percentage)
 * - totalIncome: number (optional, for tooltip)
 * - totalSavings: number (optional, for tooltip)
 * - size: number (diameter in px, default 220)
 * - className: string (optional)
 */
export interface SavingsRateGaugeProps {
  savingsRate: number; // 0-100
  totalIncome?: number;
  totalSavings?: number;
  size?: number;
  className?: string;
}

/**
 * SavingsRateGauge
 * - Semi-circular SVG gauge chart for savings rate.
 * - Needle animates to savingsRate.
 * - Color zones: red (0-10%), yellow (10-20%), green (20-100%).
 * - Accessible: aria-label, visually hidden value.
 */
const SavingsRateGauge: React.FC<SavingsRateGaugeProps> = ({
  savingsRate,
  totalIncome,
  totalSavings,
  size = 220,
  className,
}) => {
  // Clamp savingsRate between 0 and 100
  const rate = Math.max(0, Math.min(100, savingsRate));

  // Gauge geometry
  const strokeWidth = 18;
  const radius = (size / 2) - strokeWidth;
  const centerX = size / 2;
  const centerY = size / 2;
  const arcStart = 180; // degrees
  const arcEnd = 0;     // degrees
  const arcSweep = arcStart - arcEnd; // 180 deg

  // Helper: Convert percentage to angle (0 = left, 100 = right)
  const percentToAngle = (percent: number) => arcStart - (arcSweep * (percent / 100));

  // Helper: Polar to Cartesian
  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = (angleDeg - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleRad)),
      y: cy + (r * Math.sin(angleRad)),
    };
  }

  // Helper: Describe arc path for SVG
  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }

  // Gauge zones: color-coded arcs
  const zones = [
    { start: 180, end: 162, color: 'error', label: 'Low' },   // 0-10%
    { start: 162, end: 144, color: 'warning', label: 'Below Avg' }, // 10-20%
    { start: 144, end: 0, color: 'success', label: 'Healthy' }, // 20-100%
  ];

  // Needle position
  const needleAngle = percentToAngle(rate);
  const needleLength = radius + strokeWidth / 2;
  const needleBase = polarToCartesian(centerX, centerY, radius - 18, needleAngle);
  const needleTip = polarToCartesian(centerX, centerY, needleLength, needleAngle);

  // Animate needle (CSS transition)
  const [animatedAngle, setAnimatedAngle] = React.useState(needleAngle);
  React.useEffect(() => {
    setAnimatedAngle(needleAngle);
  }, [needleAngle]);

  // Accessible label
  const ariaLabel = `Savings Rate: ${formatPercentage(rate, 1)}.`;

  // Tooltip content
  const tooltip = totalIncome !== undefined && totalSavings !== undefined
    ? `Saved ${formatPercentage(rate, 1)} of income (${formatPercentage(totalSavings / totalIncome, 1)}).`
    : `Savings Rate: ${formatPercentage(rate, 1)}.`;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        className
      )}
      aria-label={ariaLabel}
      title={tooltip}
      tabIndex={0}
    >
      <svg
        width={size}
        height={size / 2}
        viewBox={`0 0 ${size} ${size / 2}`}
        className="block"
        role="img"
        aria-hidden="true"
      >
        {/* Gauge background */}
        <path
          d={describeArc(centerX, centerY, radius, arcStart, arcEnd)}
          stroke="#CBD5E1"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Gauge zones */}
        {zones.map((zone, idx) => (
          <path
            key={zone.label}
            d={describeArc(centerX, centerY, radius, zone.start, zone.end)}
            stroke={
              zone.color === 'error'
                ? '#EF4444'
                : zone.color === 'warning'
                ? '#FACC15'
                : '#22C55E'
            }
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
        {/* Needle */}
        <line
          x1={needleBase.x}
          y1={needleBase.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#3B82F6"
          strokeWidth={6}
          strokeLinecap="round"
          style={{
            transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        {/* Needle knob */}
        <circle
          cx={centerX}
          cy={centerY}
          r={12}
          fill="#3B82F6"
          stroke="#fff"
          strokeWidth={3}
        />
        {/* Tick marks */}
        {[0, 10, 20, 40, 60, 80, 100].map((pct) => {
          const angle = percentToAngle(pct);
          const tickStart = polarToCartesian(centerX, centerY, radius - 8, angle);
          const tickEnd = polarToCartesian(centerX, centerY, radius + 8, angle);
          return (
            <line
              key={pct}
              x1={tickStart.x}
              y1={tickStart.y}
              x2={tickEnd.x}
              y2={tickEnd.y}
              stroke="#64748B"
              strokeWidth={pct % 20 === 0 ? 4 : 2}
              opacity={pct % 20 === 0 ? 0.8 : 0.5}
            />
          );
        })}
        {/* Percentage label */}
        <text
          x={centerX}
          y={centerY - 18}
          textAnchor="middle"
          fontSize={32}
          fontFamily="Montserrat, Inter, sans-serif"
          fill="#334155"
          fontWeight={700}
        >
          {formatPercentage(rate, 1)}
        </text>
        {/* Sub-label */}
        <text
          x={centerX}
          y={centerY + 18}
          textAnchor="middle"
          fontSize={16}
          fontFamily="Inter, sans-serif"
          fill="#64748B"
        >
          Savings Rate
        </text>
      </svg>
      {/* Visually hidden value for screen readers */}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default SavingsRateGauge;