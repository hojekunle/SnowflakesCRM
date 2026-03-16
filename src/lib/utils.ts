import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STAGES = [
  'New',
  'Contacted',
  'Meeting Set',
  'Proposal',
  'Won',
  'Lost'
];
