import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates a Date object set to 12:00:00 (Noon) local time from a "YYYY-MM-DD" string.
 * This prevents timezone offsets from shifting the date to the previous day
 * when the date is converted to UTC (which happens by default with new Date('YYYY-MM-DD')).
 */
export const parseDateToNoon = (dateString: string): Date => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  // Constructor: year, monthIndex (0-11), day, hours, minutes, seconds
  return new Date(year, month - 1, day, 12, 0, 0);
};

/**
 * Creates a Date object set to 00:00:00 (Start of Day) local time from a "YYYY-MM-DD" string.
 */
export const parseDateToStartOfDay = (dateString: string): Date => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

/**
 * Creates a Date object set to 23:59:59.999 (End of Day) local time from a "YYYY-MM-DD" string.
 */
export const parseDateToEndOfDay = (dateString: string): Date => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};
