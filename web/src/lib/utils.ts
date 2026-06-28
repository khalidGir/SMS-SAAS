import { type ClassValue, clsx } from 'clsx';

/**
 * Merge class names with Tailwind support.
 * Replace clsx with tailwind-merge for conflict resolution in production.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a number as currency.
 */
export function formatCurrency(amount: number, currency = 'ETB'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a human-readable form.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
