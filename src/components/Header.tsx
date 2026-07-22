'use client';
import { Bell, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const authRole = localStorage.getItem('auth_role');
    if (authRole) {
      setRole(authRole);
    } else {
      const usrStr = localStorage.getItem('user');
      if (usrStr) {
        try {
          setRole(JSON.parse(usrStr).role);
        } catch (e) {}
      }
    }
  }, []);

  return (
    <header className="h-20 px-4 md:px-8 flex items-center justify-between w-full z-10 pt-4 pb-2">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Removed dummy search bar that was confusing the user */}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-white rounded-xl transition-colors shadow-sm bg-white/40 border border-transparent hover:border-slate-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse blur-[1px]"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        
        <div className="h-10 border-l border-slate-200 mx-2"></div>
        
        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-brand-dark leading-tight">{role === 'ADMIN' ? 'Admin AlpiSerra' : (role || 'AlpiSerra')}</p>
            <p className="text-xs text-slate-500 font-medium">Gestão Operacional</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
}
