import { LayoutDashboard, Film, CreditCard, Shield, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const ADMIN_MOBILE_BREAKPOINT = 1024;

export type AdminPage = 'dashboard' | 'filmes' | 'pagamentos' | 'protecao' | 'configuracoes';

const menuItems: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'filmes', label: 'Filmes', icon: Film },
  { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { id: 'protecao', label: 'Proteção', icon: Shield },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ currentPage, onNavigate, onLogout }: AdminSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < ADMIN_MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNavigate = (page: AdminPage) => {
    onNavigate(page);
    setOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground text-lg">CineAdmin</span>
        </div>
        {isMobile && (
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              currentPage === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <Film className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">CineAdmin</span>
        </div>

        {/* Overlay */}
        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-card flex flex-col h-full shadow-xl">
              {sidebarContent}
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
          </div>
        )}
      </>
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {sidebarContent}
    </aside>
  );
}
