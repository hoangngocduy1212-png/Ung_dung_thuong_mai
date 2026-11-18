import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Đang tải dữ liệu...',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}
    >
      <Loader2
        className={`${sizeMap[size]} text-brand-accent animate-spin shrink-0`}
        style={{ animationDuration: '0.75s' }}
      />
      {message && <p className="text-sm font-medium text-brand-muted">{message}</p>}
      <span className="sr-only">Đang tải...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
