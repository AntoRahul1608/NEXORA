import React from 'react';

interface BadgeProps {
  text?: string;
  label?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  label,
  variant = 'default',
  className = '',
}) => {
  const badgeText = text || label || '';

  const variantStyles = {
    success: 'bg-accent-success/10 text-accent-success border-accent-success/20',
    warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error border-accent-error/20',
    info: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
    default: 'bg-dark-600 text-dark-200 border-dark-500',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {badgeText}
    </span>
  );
};
