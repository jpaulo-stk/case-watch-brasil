export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isBlank = (value: string): boolean => value.trim().length === 0;
