import React from 'react';
import { AlertTriangle, ShieldCheck, User, Users } from 'lucide-react';
import type { UserAccount } from '../types';

interface HeaderProps {
  pantryCount: number;
  totalPantryValue: number;
  expiringSoonCount: number;
  onOpenRecipes: () => void;
  pendingProposalsCount?: number;
  onOpenAdminPanel?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenShareFridge?: () => void;
  householdName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  pantryCount,
  totalPantryValue,
  expiringSoonCount,
  onOpenRecipes,
  pendingProposalsCount = 0,
  onOpenAdminPanel,
  currentUser,
  onOpenAuthModal,
  onOpenShareFridge,
  householdName,
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sticky top-0 z-20 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>🍳</span> MyFridge
          </h1>
          <p className="text-xs text-emerald-100">Control de frigo, compras y recetas</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenShareFridge && (
            <button
              onClick={onOpenShareFridge}
              title={`Frigo Compartido: ${householdName || 'Mi Piso'}`}
              className="p-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-emerald-100 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
            >
              <Users className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          )}

          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              title={currentUser ? `Cuenta: ${currentUser.email}` : 'Iniciar sesión'}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-emerald-100 hover:text-white flex items-center gap-1 text-xs"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline max-w-[90px] truncate">
                {currentUser?.name || 'Entrar'}
              </span>
            </button>
          )}

          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              title="Panel de Administrador de Alimentos"
              className="relative p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-emerald-100 hover:text-white"
            >
              <ShieldCheck className="w-4 h-4" />
              {pendingProposalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-bold text-[9px] flex items-center justify-center">
                  {pendingProposalsCount}
                </span>
              )}
            </button>
          )}

          <div className="text-right">
            <span className="text-xs bg-emerald-500/40 border border-emerald-400/50 px-2.5 py-1 rounded-full font-medium inline-block">
              {pantryCount} prods
            </span>
            {totalPantryValue > 0 && (
              <p className="text-[11px] text-emerald-200 mt-1 font-semibold">
                Valor: {totalPantryValue.toFixed(2)}€
              </p>
            )}
          </div>
        </div>
      </div>

      {expiringSoonCount > 0 && (
        <div
          onClick={onOpenRecipes}
          className="mt-3 bg-amber-500/20 border border-amber-300/40 rounded-xl p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-500/30 transition"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>¡Atención!</strong> {expiringSoonCount} producto{expiringSoonCount > 1 ? 's caducan' : ' caduca'} pronto.
            </span>
          </div>
          <span className="underline font-semibold text-[11px]">Ver recetas</span>
        </div>
      )}
    </header>
  );
};

