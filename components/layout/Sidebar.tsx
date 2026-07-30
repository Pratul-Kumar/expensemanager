'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, StickyNote, Wallet, Settings, Layers } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/expenses', label: 'Expenses', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex flex-col w-56 shrink-0 bg-white border-r border-gray-100 min-h-screen sticky top-0 py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
          <Layers size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">Notely</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
