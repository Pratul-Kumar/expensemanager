'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useDailyReminder } from '@/hooks/useDailyReminder';
import { ToastContainer } from '@/components/ui/Toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';

interface AppContextType {
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AppContext = createContext<AppContextType>({
  addToast: () => {},
});

export function useAppContext() {
  return useContext(AppContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const { settings } = useUserSettings();
  useDailyReminder(settings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (!user) {
    return null;
  }

  return (
    <AppContext.Provider value={{ addToast }}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 sm:pb-0">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
        <BottomNav />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </AppContext.Provider>
  );
}
