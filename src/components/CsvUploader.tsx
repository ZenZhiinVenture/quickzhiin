'use client';
import React, { useRef, useState } from 'react';
import { UploadCloud, FileType, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/button';

interface CsvUploaderProps {
  onUpload: (file: File) => Promise<{ success: boolean; message: string; errors?: string[] }>;
  templateUrl?: string;
}

export function CsvUploader({ onUpload, templateUrl }: CsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // reset
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await onUpload(file);
      setResult(res);
      if (res.success) {
        setFile(null); // Clear on success
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-2xl border border-white/10 shadow-2xl p-8 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold">Import CSV File</h2>
        <p className="text-sm text-muted-foreground">
          Upload your data securely. Check the template if you are unsure of the headers.
        </p>
      </div>

      {/* Drop Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
      >
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-full text-primary">
              <FileType size={32} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <UploadCloud size={40} className="opacity-50" />
            <div>
              <p className="font-medium text-foreground">Click to upload or drag and drop</p>
              <p className="text-xs mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
        )}
      </div>

      {/* Result Status */}
      {result && (
        <div className={`p-4 rounded-lg border flex gap-3 ${result.success ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
          {result.success ? <CheckCircle className="shrink-0" /> : <XCircle className="shrink-0" />}
          <div className="space-y-1">
            <p className="font-semibold">{result.message}</p>
            {result.errors && result.errors.length > 0 && (
              <ul className="text-sm list-disc pl-4 opacity-80 space-y-1 mt-2">
                {result.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {result.errors.length > 5 && (
                  <li>...and {result.errors.length - 5} more errors.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button 
          className="w-full vibrant-gradient text-white h-11" 
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? 'Processing...' : 'Upload & Process Data'}
        </Button>
        {templateUrl && (
          <Button variant="ghost" className="w-full" onClick={() => window.open(templateUrl)}>
            Download Sample Template
          </Button>
        )}
      </div>
    </div>
  );
}
