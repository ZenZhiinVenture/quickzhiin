'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/dialog';
import { CsvUploader } from '@/components/CsvUploader';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  templateUrl?: string;
  onUpload: (file: File) => Promise<{ success: boolean; message: string; errors?: string[] }>;
  onSuccess?: () => void;
}

export function ImportModal({
  isOpen,
  onClose,
  title,
  description,
  templateUrl,
  onUpload,
  onSuccess
}: ImportModalProps) {
  
  const handleUpload = async (file: File) => {
    const res = await onUpload(file);
    if (res.success && onSuccess) {
      onSuccess();
    }
    return res;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-3xl border-white/10 shadow-2xl p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 pt-2 bg-gradient-to-b from-transparent to-primary/5">
          <CsvUploader onUpload={handleUpload} templateUrl={templateUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
