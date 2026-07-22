'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, AlertCircle, Users, Briefcase, Settings, FileText, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard Diário', href: '/', icon: LayoutDashboard },
  { name: 'Relatórios e Alertas', href: '/relatorios', icon: FileText },
  { name: 'Colaboradores', href: '/colaboradores', icon: Users },
  { name: 'Clientes', href: '/clientes', icon: Briefcase },
  { name: 'Disponibilidade (Livres)', href: '/disponibilidade', icon: Users },
  { name: 'Afastamentos', href: '/afastamentos', icon: AlertCircle },
  { name: 'Tratamento das Férias', href: '/ferias', icon: FileText },
  { name: 'Gerenciar Usuários', href: '/usuarios', icon: Shield },
];

export function Sidebar({ isMobileOpen, onClose }: { isMobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_role');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

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
      } else {
        setRole(null);
      }
    }
  }, [pathname]);

  const visibleNavItems = navItems.filter(item => {
    if (item.name === 'Gerenciar Usuários') return role === 'ADMIN';
    return true;
  });

  return (
    <aside className={cn(
      "w-64 glass-panel flex flex-col rounded-2xl z-50 h-[calc(100vh-2rem)] shadow-xl md:shadow-lg overflow-hidden flex-shrink-0 transition-transform duration-300 md:relative fixed top-4 md:m-4 md:mr-0",
      isMobileOpen ? "translate-x-4" : "-translate-x-[120%] md:translate-x-0"
    )}>
      <div className="p-6 flex items-center gap-3">
        {/* Brand Icon or Logo Simulation */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-teal flex items-center justify-center text-white font-bold text-xl shadow-md">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-brand-dark leading-none">AlpiSerra</span>
          <span className="text-[10px] uppercase text-brand-teal mt-1 font-semibold tracking-wider">Painel Operacional</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 flex flex-col gap-1.5">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-brand-cyan/10 text-brand-teal" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-brand-cyan" : "text-slate-400 group-hover:text-slate-600"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center shadow-sm space-y-3">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">Precisando de suporte?</p>
            <button className="w-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
              Falar com T.I.
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-red-50 border border-red-100 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  );
}
