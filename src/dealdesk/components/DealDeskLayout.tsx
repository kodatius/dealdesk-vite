import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Deals', href: '/deals', icon: '🏠' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function DealDeskLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-nova-black">
      <SignedOut>
        <div className="flex justify-center items-center min-h-screen">
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 border-r border-white/10 bg-nova-charcoal flex flex-col">
            <div className="px-6 py-6 border-b border-white/10">
              <a href="https://novacapmanagement.com/portal" className="block mb-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-nova-stone hover:text-nova-gold transition-colors">← Portal</span>
              </a>
              <h1 className="font-serif text-xl text-white">DealDesk</h1>
            </div>
            <nav className="flex-1 py-4">
              {NAV.map((item) => {
                const active = item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                      active
                        ? 'text-nova-gold bg-white/5 border-r-2 border-nova-gold'
                        : 'text-nova-stone hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="tracking-wide">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="px-6 py-4 border-t border-white/10">
              <UserButton />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SignedIn>
    </div>
  );
}
