import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      theme = 'light',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    const isDark = theme === 'dark';

    const themeStyles = isDark
      ? {
          label: 'text-xs font-semibold tracking-wider text-[#8C8E94] uppercase',
          input:
            'bg-[#141519] text-white placeholder:text-[#555963] border-[#262930] hover:border-[#3A3E47]',
          focus:
            'focus:outline-none focus-visible:border-brand-accent focus-visible:ring-1 focus-visible:ring-brand-accent',
          errorInput: 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500',
          icon: 'text-[#737373]',
          disabled: 'disabled:bg-[#1A1C22] disabled:text-[#555963] disabled:border-[#262930]',
        }
      : {
          label: 'text-sm font-medium text-brand-primary',
          input:
            'bg-white text-brand-primary placeholder:text-brand-muted border-brand-border hover:border-neutral-400',
          focus:
            'focus:outline-none focus-visible:border-brand-accent focus-visible:ring-1 focus-visible:ring-brand-accent',
          errorInput: 'border-brand-danger focus-visible:border-brand-danger focus-visible:ring-brand-danger',
          icon: 'text-brand-muted',
          disabled: 'disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-brand-border',
        };

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className={`${themeStyles.label} select-none`}>
            {label}
            {props.required && <span className="text-brand-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div
              className={`absolute left-3.5 ${themeStyles.icon} pointer-events-none flex items-center justify-center`}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`w-full h-10 px-3.5 text-sm rounded-lg border transition-colors duration-150 ease-[var(--ease-out)] ${
              themeStyles.input
            } ${themeStyles.focus} ${error ? themeStyles.errorInput : ''} ${
              themeStyles.disabled
            } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div
              className={`absolute right-3.5 ${themeStyles.icon} flex items-center justify-center`}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-brand-danger font-medium mt-0.5"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className={`text-xs ${isDark ? 'text-[#8C8E94]' : 'text-brand-muted'} mt-0.5`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
