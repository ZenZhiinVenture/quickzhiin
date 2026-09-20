'use client';

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/dialog';
import { tradeAPI } from '@/services/api/trade';
import { Loader2, History } from 'lucide-react';
import dayjs from 'dayjs';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await tradeAPI.getSalesActivityLogs();
      setLogs(res.data.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] bg-background border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 vibrancy-gradient text-white">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <History size={28} /> Activity Logs
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Recent activities in the sales module.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              No activity logs found.
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log: any) => (
                <div key={log.id} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <History size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {log.user?.firstName} {log.user?.lastName} <span className="font-normal text-muted-foreground">{log.action.toLowerCase()}d</span> a {log.tableName.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(log.createdAt).format('DD MMM YYYY, hh:mm A')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
