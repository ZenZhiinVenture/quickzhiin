'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function getStatusClasses(status: string): string {
  const s = status?.toUpperCase() ?? '';

  switch (s) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'READY':
    case 'APPROVED':
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'PAID':
    case 'VALID':
    case 'COMPLETED':
    case 'CLEARED':
    case 'RECONCILED':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'OVERDUE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'CANCELLED':
    case 'VOID':
    case 'REJECTED':
      return 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400';
    case 'SUBMITTED':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    default:
      return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  }
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusClasses(status)} ${className}`}
    >
      {status}
    </span>
  );
}
