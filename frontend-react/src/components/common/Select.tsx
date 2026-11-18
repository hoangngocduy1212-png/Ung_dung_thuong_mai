import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  theme?: 'light' | 'dark';
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Chọn tùy chọn',
  disabled = false,
  error,
  helperText,
  className = '',
  id,
  theme = 'light',
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(
    value !== undefined ? value : defaultValue || ''
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync external value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Adjust focusedIndex when options change to prevent out-of-bounds
  useEffect(() => {
    if (focusedIndex >= options.length) {
      setFocusedIndex(options.length - 1);
    }
  }, [options.length, focusedIndex]);

  const selectedOption = options.find((opt) => opt.value === internalValue);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (disabled) return;
      const targetOption = options.find((opt) => opt.value === optionValue);
      if (targetOption?.disabled) return;

      setInternalValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [disabled, onChange, options]
  );

  // Find next enabled option index
  const getNextEnabledIndex = useCallback(
    (startIndex: number, direction: 1 | -1): number => {
      const len = options.length;
      if (len === 0) return -1;
      let curr = startIndex + direction;
      for (let i = 0; i < len; i++) {
        if (curr < 0) curr = len - 1;
        if (curr >= len) curr = 0;
        if (!options[curr]?.disabled) {
          return curr;
        }
        curr += direction;
      }
      return -1;
    },
    [options]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && options[focusedIndex] && !options[focusedIndex].disabled) {
        handleSelect(options[focusedIndex].value);
      } else {
        setIsOpen(!isOpen);
        if (!isOpen) {
          const initialIndex = options.findIndex((opt) => opt.value === internalValue && !opt.disabled);
          setFocusedIndex(initialIndex >= 0 ? initialIndex : getNextEnabledIndex(-1, 1));
        }
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const initialIndex = options.findIndex((opt) => opt.value === internalValue && !opt.disabled);
        setFocusedIndex(initialIndex >= 0 ? initialIndex : getNextEnabledIndex(-1, 1));
      } else {
        setFocusedIndex((prev) => getNextEnabledIndex(prev, 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const initialIndex = options.findIndex((opt) => opt.value === internalValue && !opt.disabled);
        setFocusedIndex(initialIndex >= 0 ? initialIndex : getNextEnabledIndex(options.length, -1));
      } else {
        setFocusedIndex((prev) => getNextEnabledIndex(prev, -1));
      }
    } else if (e.key === 'Home' && isOpen) {
      e.preventDefault();
      setFocusedIndex(getNextEnabledIndex(-1, 1));
    } else if (e.key === 'End' && isOpen) {
      e.preventDefault();
      setFocusedIndex(getNextEnabledIndex(options.length, -1));
    }
  };

  const themeStyles = isDark
    ? {
        label: 'text-xs font-semibold tracking-wider text-[#8C8E94] uppercase',
        trigger: 'bg-[#141519] text-white border-[#262930] hover:border-[#3A3E47]',
        dropdown: 'bg-[#141519] border-[#262930] shadow-xl text-white',
        item: 'hover:bg-[#1C1E24] text-neutral-200',
        activeItem: 'bg-[#1C1E24] text-brand-accent font-medium',
      }
    : {
        label: 'text-sm font-medium text-brand-primary',
        trigger: 'bg-white text-brand-primary border-brand-border hover:border-neutral-400',
        dropdown: 'bg-white border-brand-border shadow-lg text-brand-primary',
        item: 'hover:bg-brand-surface text-brand-primary',
        activeItem: 'bg-brand-accent-subtle text-brand-accent font-medium',
      };

  const activeDescendantId =
    isOpen && focusedIndex >= 0 && options[focusedIndex]
      ? `${selectId}-opt-${focusedIndex}`
      : undefined;

  return (
    <div ref={containerRef} className={`w-full flex flex-col gap-1.5 text-left relative ${className}`}>
      {label && (
        <label htmlFor={selectId} className={`${themeStyles.label} select-none`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={activeDescendantId}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              const initialIndex = options.findIndex((opt) => opt.value === internalValue && !opt.disabled);
              setFocusedIndex(initialIndex >= 0 ? initialIndex : getNextEnabledIndex(-1, 1));
            }
          }
        }}
        onKeyDown={handleKeyDown}
        className={`w-full h-10 px-3.5 text-sm rounded-lg border transition-all duration-150 ease-[var(--ease-out)] flex items-center justify-between gap-2 text-left cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:border-transparent ${
          themeStyles.trigger
        } ${error ? 'border-brand-danger' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className={`truncate ${!selectedOption ? 'text-brand-muted' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-brand-muted transition-transform duration-180 ease-[var(--ease-out)] shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu (Origin-aware from top) */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? selectId : undefined}
          tabIndex={-1}
          style={{ transformOrigin: 'top center' }}
          className={`absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-lg border p-1 max-h-60 overflow-y-auto ${themeStyles.dropdown}`}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === internalValue;
            const isFocused = idx === focusedIndex;
            const optId = `${selectId}-opt-${idx}`;
            return (
              <div
                key={option.value}
                id={optId}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 text-sm rounded-md flex items-center justify-between cursor-pointer select-none transition-colors duration-100 ${
                  option.disabled ? 'opacity-40 cursor-not-allowed' : themeStyles.item
                } ${isSelected ? themeStyles.activeItem : ''} ${
                  isFocused && !isSelected ? 'bg-brand-surface' : ''
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-brand-accent shrink-0" />}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-brand-danger font-medium mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-brand-muted mt-0.5">{helperText}</p>}
    </div>
  );
};
