import { Home, PlusCircle, Users, List } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: PlusCircle, label: 'Novo Serviço', path: '/novo-servico' },
  { icon: Users, label: 'Ajudantes', path: '/pagamentos' },
  { icon: List, label: 'Serviços', path: '/servicos' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-accent" 
                  : "text-muted-foreground hover:text-copper"
              )}
            >
              <item.icon 
                className={cn(
                  "w-6 h-6 mb-1 transition-transform duration-200",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
