import React from 'react';
import { Refrigerator, ShoppingCart, ScanLine, ChefHat } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'frigo' | 'compra' | 'recetas' | 'ticket';
  setActiveTab: (tab: 'frigo' | 'compra' | 'recetas' | 'ticket') => void;
  shoppingListCount: number;
  hasActiveTicketSession: boolean;
  ticketPendingCount?: number;
  expiringSoonCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  shoppingListCount,
  hasActiveTicketSession,
  ticketPendingCount,
  expiringSoonCount
}) => {
  const tabs = [
    {
      id: 'frigo' as const,
      label: 'Frigo',
      icon: Refrigerator,
      badge: null
    },
    {
      id: 'compra' as const,
      label: 'Compra',
      icon: ShoppingCart,
      badge: shoppingListCount > 0 ? (
        <span className="min-w-4 h-4 px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
          {shoppingListCount}
        </span>
      ) : null
    },
    {
      id: 'ticket' as const,
      label: 'Ticket',
      icon: ScanLine,
      badge: hasActiveTicketSession ? (
        <span className="min-w-4 h-4 px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
          {ticketPendingCount || '!'}
        </span>
      ) : null
    },
    {
      id: 'recetas' as const,
      label: 'Recetas',
      icon: ChefHat,
      badge: expiringSoonCount > 0 ? (
        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
      ) : null
    }
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
      <nav 
        aria-label="Navegación principal"
        className="pointer-events-auto bg-slate-950/90 backdrop-blur-xl border border-white/15 text-slate-400 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] rounded-full p-1.5 flex items-center justify-between gap-1 max-w-sm sm:max-w-md w-full transition-all duration-300"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center gap-1.5 py-2 px-3 sm:px-4 rounded-full text-xs font-semibold transition-all duration-200 select-none flex-1 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 font-bold scale-[1.02]'
                  : 'hover:text-slate-200 hover:bg-white/5 active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-2 -right-2.5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`tracking-tight ${isActive ? 'inline' : 'hidden sm:inline'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
