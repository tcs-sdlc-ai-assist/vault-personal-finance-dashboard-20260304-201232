import { useState, useEffect } from 'react';

/************************************************************
 * useMediaQuery.ts
 * Vault - Custom hook for responsive breakpoint detection.
 * - Detects viewport matches for Tailwind breakpoints.
 * - Used for adaptive layouts (sidebar, bottom nav, modals, etc.).
 * - Returns boolean flags for each breakpoint and utility helpers.
 ************************************************************/

/**
 * Tailwind breakpoints (must match tailwind.config.ts)
 */
export const BREAKPOINTS = {
  xs: 420,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * useMediaQuery
 * - Returns boolean flags for each breakpoint (xs, sm, md, lg, xl, 2xl).
 * - Also provides utility helpers: isMobile, isTablet, isDesktop, currentBreakpoint.
 * @returns {
 *   isXs: boolean,
 *   isSm: boolean,
 *   isMd: boolean,
 *   isLg: boolean,
 *   isXl: boolean,
 *   is2xl: boolean,
 *   isMobile: boolean,
 *   isTablet: boolean,
 *   isDesktop: boolean,
 *   currentBreakpoint: keyof typeof BREAKPOINTS,
 *   width: number,
 * }
 */
export default function useMediaQuery() {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Update width on resize
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    // Initial update in case SSR
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute breakpoint flags
  const isXs = width >= BREAKPOINTS.xs && width < BREAKPOINTS.sm;
  const isSm = width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
  const isMd = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isLg = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
  const isXl = width >= BREAKPOINTS.xl && width < BREAKPOINTS['2xl'];
  const is2xl = width >= BREAKPOINTS['2xl'];

  // Utility: isMobile (< md), isTablet (md), isDesktop (>= lg)
  const isMobile = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  // Utility: currentBreakpoint (returns largest matched)
  let currentBreakpoint: keyof typeof BREAKPOINTS = 'xs';
  if (is2xl) currentBreakpoint = '2xl';
  else if (isXl) currentBreakpoint = 'xl';
  else if (isLg) currentBreakpoint = 'lg';
  else if (isMd) currentBreakpoint = 'md';
  else if (isSm) currentBreakpoint = 'sm';
  else currentBreakpoint = 'xs';

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    width,
  };
}