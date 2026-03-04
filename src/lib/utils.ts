/************************************************************
 * src/lib/utils.ts
 * Vault - Generic utility helpers for classnames and generic logic.
 * Used throughout the app for composable, stateless utilities.
 ************************************************************/

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Compose classnames with clsx and tailwind-merge.
 * - Handles conditional, array, and object syntax.
 * - Ensures Tailwind classes are deduped and merged.
 * @param inputs Classnames (string, array, object, etc.)
 * @returns Merged className string
 */
export function cn(...inputs: Parameters<typeof clsx>): string {
  return twMerge(clsx(...inputs));
}

/**
 * shallowEqual - Shallow comparison of two objects.
 * - Only compares own enumerable properties.
 * @param objA First object
 * @param objB Second object
 * @returns True if shallowly equal, false otherwise
 */
export function shallowEqual<T extends object>(objA: T, objB: T): boolean {
  if (objA === objB) return true;
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false;
    if ((objA as any)[key] !== (objB as any)[key]) return false;
  }
  return true;
}

/**
 * isEmpty - Checks if a value is empty.
 * - Handles string, array, object, null, undefined.
 * @param value Value to check
 * @returns True if empty, false otherwise
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * debounce - Debounce a function by delay ms.
 * - Returns a debounced version of the function.
 * @param fn Function to debounce
 * @param delay Delay in ms
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * clamp - Clamp a number between min and max.
 * @param value Number to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped number
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * uuid - Generate a simple UUID (v4-like, not cryptographically secure).
 * - Used for client-side unique keys.
 * @returns UUID string
 */
export function uuid(): string {
  // RFC4122 v4-compliant, but not cryptographically secure
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * copyToClipboard - Copy text to clipboard, with fallback.
 * @param text Text to copy
 * @returns Promise<void>
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (err) {
    // Fail silently, caller can handle toast/error
  }
}

/**
 * downloadFile - Trigger a client-side download of a file.
 * @param filename Filename for download
 * @param content File content (string or Blob)
 * @param mimeType MIME type (default: 'application/octet-stream')
 */
export function downloadFile(
  filename: string,
  content: string | Blob,
  mimeType: string = 'application/octet-stream'
): void {
  let blob: Blob;
  if (typeof content === 'string') {
    blob = new Blob([content], { type: mimeType });
  } else {
    blob = content;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * safeParseJSON - Safely parse JSON, returning fallback on error.
 * @param value JSON string
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeParseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * throttle - Throttle a function to run at most once every delay ms.
 * @param fn Function to throttle
 * @param delay Delay in ms
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * isBrowser - Returns true if running in browser environment.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * sleep - Returns a promise that resolves after ms milliseconds.
 * @param ms Milliseconds to sleep
 * @returns Promise<void>
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}