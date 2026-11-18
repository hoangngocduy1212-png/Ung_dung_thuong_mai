import React, { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isConfirmLoading?: boolean;
  isDanger?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

// Global modal counter to handle multiple modals safely
let activeModalCount = 0;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  isConfirmLoading = false,
  isDanger = false,
  showFooter = true,
  maxWidth = 'md',
  closeOnOverlayClick = true,
}) => {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descId = `${generatedId}-desc`;

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Focus restoration & body scroll locking
  useEffect(() => {
    if (isOpen) {
      // Store trigger element
      triggerRef.current = document.activeElement as HTMLElement | null;

      // Lock body scroll using reference count
      if (activeModalCount === 0) {
        document.body.style.overflow = 'hidden';
      }
      activeModalCount++;

      return () => {
        // Unlock scroll on close or unmount
        activeModalCount = Math.max(0, activeModalCount - 1);
        if (activeModalCount === 0) {
          document.body.style.overflow = '';
        }

        // Restore focus to trigger element
        if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus the modal or first focusable child
    const focusTimer = setTimeout(() => {
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null); // Visible elements only

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={() => closeOnOverlayClick && onClose()}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{
              duration: 0.22,
              ease: [0.23, 1, 0.32, 1], // Emil Kowalski custom ease-out
            }}
            style={{ transformOrigin: 'center' }}
            className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white rounded-lg border border-brand-border shadow-xl overflow-hidden z-10 text-left outline-none`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-brand-border">
              <div>
                {title && (
                  <h3 id={titleId} className="text-lg font-bold font-display text-brand-primary">
                    {title}
                  </h3>
                )}
                {description && (
                  <p id={descId} className="text-xs text-brand-muted mt-0.5">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hộp thoại"
                className="w-8 h-8 rounded-md flex items-center justify-center text-brand-muted hover:text-brand-primary hover:bg-brand-surface transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5 text-sm text-brand-primary">{children}</div>

            {/* Footer */}
            {showFooter && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-brand-surface/60 border-t border-brand-border">
                <Button variant="outline" size="md" onClick={onClose} disabled={isConfirmLoading}>
                  {cancelText}
                </Button>
                {onConfirm && (
                  <Button
                    variant={isDanger ? 'danger' : 'primary'}
                    size="md"
                    isLoading={isConfirmLoading}
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
