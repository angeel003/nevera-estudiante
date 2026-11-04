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
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around py-2 px-1 z-30 shadow-lg">
      <button
        onClick={() => setActiveTab('frigo')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
          activeTab === 'frigo' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Refrigerator className="w-5 h-5" />
        <span className="text-[11px] mt-1">Frigo</span>
      </button>

      <button
        onClick={() => setActiveTab('compra')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition relative ${
          activeTab === 'compra' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-[11px] mt-1">Compra</span>
        {shoppingListCount > 0 && (
          <span className="absolute top-1 right-2.5 w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {shoppingListCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('ticket')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition relative ${
          activeTab === 'ticket' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <ScanLine className="w-5 h-5" />
        <span className="text-[11px] mt-1">Ticket OCR</span>
        {hasActiveTicketSession && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {ticketPendingCount || '!'}
          </span>
        )}
      </button>

      <button
        onClick={() => setActiveTab('recetas')}
        className={`flex flex-col items-center py-1 px-3 rounded-xl transition relative ${
          activeTab === 'recetas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <ChefHat className="w-5 h-5" />
        <span className="text-[11px] mt-1">Recetas</span>
        {expiringSoonCount > 0 && (
          <span className="absolute top-1 right-2.5 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
        )}
      </button>
    </nav>
  );
};

