'use client';

import React from 'react';
import { Button } from '@/components/button';
import { Trash2, X, Loader2 } from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onStatusChange?: (status: string) => void;
  isLoading?: boolean;
  onClear: () => void;
}

export function BatchActionBar({
  selectedCount,
  onDelete,
  onStatusChange,
  isLoading = false,
  onClear,
}: BatchActionBarProps) {
  const isVisible = selectedCount > 0;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="glass shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-4 border border-border">
        <span className="text-sm font-semibold text-foreground">
          <span className="bg-primary text-white rounded-full px-2 py-0.5 text-xs mr-2">
            {selectedCount}
          </span>
          item{selectedCount !== 1 ? 's' : ''} selected
        </span>

        <div className="h-5 w-px bg-border" />

        {onStatusChange && (
          <Button
            variant="outline"
            size="sm"
            className="glass hover:bg-accent/50 text-xs"
            onClick={() => onStatusChange('APPROVED')}
            disabled={isLoading}
          >
            Mark Approved
          </Button>
        )}

        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white text-xs"
          onClick={onDelete}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={14} className="mr-1.5 animate-spin" />
          ) : (
            <Trash2 size={14} className="mr-1.5" />
          )}
          Delete Selected
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground text-xs"
          onClick={onClear}
          disabled={isLoading}
        >
          <X size={14} className="mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
}
