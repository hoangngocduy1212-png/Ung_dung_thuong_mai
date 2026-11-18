import React from 'react';
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
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-lg border border-dashed border-brand-border ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center text-brand-muted mb-3.5">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-brand-primary font-display">{title}</h4>
      <p className="text-sm text-brand-muted max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
