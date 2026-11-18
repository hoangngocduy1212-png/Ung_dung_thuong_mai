import React from 'react';
import { motion } from 'motion/react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có mục nào trong danh sách này.',
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-lg border border-dashed border-brand-border ${className}`}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center text-brand-muted mb-3.5 shadow-xs"
      >
        {icon || <PackageOpen className="w-7 h-7" />}
      </motion.div>
      <h4 className="text-base font-semibold text-brand-primary font-display">{title}</h4>
      <p className="text-sm text-brand-muted max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};
