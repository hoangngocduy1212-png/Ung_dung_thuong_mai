import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-[var(--ease-out)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]';

  const variants = {
    // Primary: Monolith Signature Orange Button
    primary:
      'bg-brand-accent hover:bg-brand-accent-hover active:bg-[#CC4900] text-white shadow-xs',
    // Secondary: Dark solid surface button (Stitch design)
    secondary:
      'bg-brand-surface hover:bg-[#EAEAEA] active:bg-[#E0E0E0] text-brand-primary border border-brand-border',
    // Dark: Dark Onyx Solid Button
    dark:
      'bg-brand-primary hover:bg-[#262626] active:bg-[#0A0A0A] text-white shadow-xs',
    // Outline: Clean Border Button
    outline:
      'border border-brand-border hover:border-brand-primary/40 hover:bg-brand-surface active:bg-brand-border/30 text-brand-primary bg-white',
    // Danger: Red Alert Button
    danger:
      'bg-brand-danger hover:bg-red-700 active:bg-red-800 text-white shadow-xs',
    // Ghost: Subtle Text Button
    ghost:
      'hover:bg-brand-surface active:bg-brand-border/40 text-brand-primary',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[48px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
    </button>
  );
};
