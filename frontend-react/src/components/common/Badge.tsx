import React from 'react';
import type { UserRole } from '../../types/auth';
import { ROLE_LABELS } from '../../lib/config';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'purple' | 'gray' | 'red' | 'orange';
  status?: 'approved' | 'pending' | 'rejected' | 'neutral';
  size?: 'sm' | 'md';
  role?: UserRole;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  role,
  dot = false,
  pulse = false,
  className = '',
}) => {
  let computedVariant = variant || 'blue';
  let content = children;

  if (status) {
    switch (status) {
      case 'approved':
        computedVariant = 'green';
        content = content || 'Đã duyệt';
        break;
      case 'pending':
        computedVariant = 'amber';
        content = content || 'Chờ duyệt';
        break;
      case 'rejected':
        computedVariant = 'red';
        content = content || 'Từ chối';
        break;
      case 'neutral':
      default:
        computedVariant = 'gray';
        break;
    }
  } else if (role) {
    content = ROLE_LABELS[role] || role;
    switch (role) {
      case 'admin':
        computedVariant = 'purple';
        break;
      case 'seller':
        computedVariant = 'green';
        break;
      case 'cskh':
        computedVariant = 'amber';
        break;
      case 'customer':
      default:
        computedVariant = 'orange';
        break;
    }
  }

  const variantStyles = {
    orange: 'bg-brand-accent-subtle text-brand-accent border border-[#FED7AA]',
    blue: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    green: 'bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]',
    amber: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    purple: 'bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]',
    gray: 'bg-[#F5F5F5] text-brand-muted border border-brand-border',
    red: 'bg-[#FEF2F2] text-brand-danger border border-[#FECACA]',
  };

  const dotColors = {
    orange: 'bg-brand-accent',
    blue: 'bg-[#2563EB]',
    green: 'bg-[#15803D]',
    amber: 'bg-[#D97706]',
    purple: 'bg-[#7E22CE]',
    gray: 'bg-brand-muted',
    red: 'bg-brand-danger',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium gap-1.5',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${variantStyles[computedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[computedVariant]}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[computedVariant]}`}
          />
        </span>
      )}
      <span>{content}</span>
    </span>
  );
};
