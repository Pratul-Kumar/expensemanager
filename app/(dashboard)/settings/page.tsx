'use client';

import React, { useState } from 'react';
import { LogOut, Info, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAppContext } from '../layout';

const APP_VERSION = '1.0.0';

export default function SettingsPage() {
  const { userProfile, logout } = useAuth();
  const { addToast } = useAppContext();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      addToast('Something went wrong', 'error');
      setLoggingOut(false);
    }
  };

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : userProfile?.email?.[0].toUpperCase() ?? '?';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Profile section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Profile</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
          {userProfile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userProfile.photoURL}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-700 font-semibold text-base">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {userProfile?.displayName ?? 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">{userProfile?.email ?? ''}</p>
          </div>
        </div>
      </section>

      {/* Account section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-50 transition-colors group"
            id="logout-btn"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-red-300" />
          </button>
        </div>
      </section>

      {/* About section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">About</h2>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-gray-400" />
              <span className="text-sm text-gray-700">App Version</span>
            </div>
            <span className="text-sm text-gray-400">{APP_VERSION}</span>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={logoutOpen}
        title="Sign out?"
        message="You will be returned to the login screen."
        confirmLabel="Sign Out"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
        loading={loggingOut}
      />
    </div>
  );
}
