import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'surface' | 'dark';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'md',
}) => {
  const variantStyles = {
    default: 'bg-white border-brand-border text-brand-primary shadow-xs',
    surface: 'bg-brand-surface border-brand-border text-brand-primary',
    dark: 'bg-brand-dark-surface border-brand-dark-border text-white',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all duration-150 ${variantStyles[variant]} ${className}`}
    >
      {(title || subtitle || actions) && (
        <div
          className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
            isDark ? 'border-brand-dark-border' : 'border-brand-border'
          }`}
        >
          <div>
            {title && (
              <h3
                className={`font-semibold text-base leading-snug font-display ${
                  isDark ? 'text-white' : 'text-brand-primary'
                }`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-[#8C8E94]' : 'text-brand-muted'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
    </div>
  );
};
