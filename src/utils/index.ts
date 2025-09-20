import { twMerge, type ClassNameValue } from 'tailwind-merge';

export function mergeClasses(...classString: ClassNameValue[]) {
  return twMerge(classString);
}
