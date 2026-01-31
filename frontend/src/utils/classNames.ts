// Utility for consistent class names
export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Common class combinations
export const inputClasses = 'w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary';
export const cardClasses = 'glass-card p-6';
export const textSecondary = 'text-text-secondary';
export const textPrimary = 'text-text-primary';

