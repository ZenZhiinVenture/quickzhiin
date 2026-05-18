'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/dialog';
import { Button } from '@/components/button';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import api from '@/services/api/api';
import { toast } from 'sonner';

interface BankStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccountId: string;
  onSuccess: () => void;
}

export function BankStatementModal({ isOpen, onClose, bankAccountId, onSuccess }: BankStatementModalProps) {
  const t = useTranslations('ModuleMenu.BankRecon');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `/bank-account/${bankAccountId}/statements`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success(t('uploadSuccess') || 'Statement uploaded successfully');
        onSuccess();
        onClose();
        setFile(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {t('uploadStatement')}
          </DialogTitle>
          <DialogDescription>
            Upload your bank statement in CSV format to start reconciliation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div 
            className={`
              border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300
              ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/50'}
            `}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload"
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            {file ? (
              <div className="text-center animate-in zoom-in-95 duration-300">
                <FileText className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="bg-accent w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs mt-1">CSV files only (Max 5MB)</p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-3 items-start">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-600 leading-relaxed font-medium">
              Ensure your CSV has headers: <b>Date, Description, Amount.</b> Amounts for deposits should be positive, withdrawals negative.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button 
            className="vibrant-gradient text-white" 
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload Statement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
