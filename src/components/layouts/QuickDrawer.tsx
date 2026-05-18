'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Cross1Icon } from '@radix-ui/react-icons';

interface QuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickDrawer({ isOpen, onClose }: QuickDrawerProps) {
  const t = useTranslations('QuickDrawer');

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('quickActions')}
              </h2>
              <button onClick={onClose} className="p-2 rounded-md">
                <Cross1Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Recent Activities */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('recentActivities')}
                </h3>
                <div className="space-y-3">
                  {/* Add your recent activities here */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('noRecentActivities')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick Tasks */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('quickTasks')}
                </h3>
                <div className="space-y-3">
                  {/* Add your quick tasks here */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t('noQuickTasks')}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
