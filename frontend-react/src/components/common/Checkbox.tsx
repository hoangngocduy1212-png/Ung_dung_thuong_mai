import React, { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
  theme?: 'light' | 'dark';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      indeterminate = false,
      theme = 'light',
      checked,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const isDark = theme === 'dark';

    return (
      <div className={`flex items-start gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="relative flex items-center justify-center shrink-0 min-w-[20px] min-h-[20px] pt-0.5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={`w-[18px] h-[18px] rounded-[4px] border transition-all duration-150 ease-[var(--ease-out)] flex items-center justify-center select-none ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            } ${
              isDark
                ? 'bg-[#141519] border-[#262930] hover:border-[#3A3E47] peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0B0C0E]'
                : 'bg-white border-brand-border hover:border-neutral-400 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white'
            } peer-checked:bg-brand-accent peer-checked:border-brand-accent peer-checked:text-white`}
          >
            {indeterminate ? (
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
            ) : checked ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : null}
          </label>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`text-sm leading-tight select-none font-medium ${
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${isDark ? 'text-[#8C8E94] hover:text-white' : 'text-brand-primary'}`}
              >
                {label}
              </label>
            )}
            {description && (
              <span
                className={`text-xs mt-0.5 leading-normal ${
                  isDark ? 'text-[#555963]' : 'text-brand-muted'
                }`}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
