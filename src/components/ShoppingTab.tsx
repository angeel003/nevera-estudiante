import React from 'react';
import { Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { ShoppingItem } from '../types';

interface ShoppingTabProps {
  shoppingList: ShoppingItem[];
  onAddItem: (e: React.FormEvent) => void;
  quickShoppingName: string;
  setQuickShoppingName: (val: string) => void;
  quickShoppingPrice: string;
  setQuickShoppingPrice: (val: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onTransferCheckedToPantry: () => void;
  onOpenOptimizer?: () => void;
}

export const ShoppingTab: React.FC<ShoppingTabProps> = ({
  shoppingList,
  onAddItem,
  quickShoppingName,
  setQuickShoppingName,
  quickShoppingPrice,
  setQuickShoppingPrice,
  onToggleItem,
  onRemoveItem,
  onTransferCheckedToPantry,
  onOpenOptimizer
}) => {
  const hasChecked = shoppingList.some(item => item.checked);
  const totalCost = shoppingList.reduce((acc, item) => acc + (item.estimatedPrice || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lista de la Compra</h2>
          <p className="text-xs text-slate-500">Planifica lo que te hace falta para tus comidas</p>
        </div>
        <div className="flex items-center gap-2">
          {shoppingList.length > 0 && onOpenOptimizer && (
            <button
              onClick={onOpenOptimizer}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Optimizar precios</span>
            </button>
          )}

          {hasChecked && (
            <button
              onClick={onTransferCheckedToPantry}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <span>Mover a la nevera</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Formulario rápido para añadir */}
      <form onSubmit={onAddItem} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex gap-2">
        <input
          type="text"
          placeholder="Ej: Pasta, Tomate frito, Leche..."
          value={quickShoppingName}
          onChange={(e) => setQuickShoppingName(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
        <input
          type="text"
          placeholder="€ (opc.)"
          value={quickShoppingPrice}
          onChange={(e) => setQuickShoppingPrice(e.target.value)}
          className="w-20 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition flex items-center justify-center shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Listado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {shoppingList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No tienes elementos en la lista de compra.
          </div>
        ) : (
          shoppingList.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                item.checked ? 'bg-emerald-50/40 text-slate-400 line-through' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onToggleItem(item.id)}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className={`text-sm font-medium ${item.checked ? 'text-slate-400' : 'text-slate-700'}`}>
                  {item.name}
                </span>
                {item.estimatedPrice !== undefined && item.estimatedPrice > 0 && (
                  <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
                    {item.estimatedPrice.toFixed(2)}€
                  </span>
                )}
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-slate-300 hover:text-red-500 p-1 transition"
                title="Eliminar de la lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {shoppingList.length > 0 && (
        <div className="text-right text-xs text-slate-500 px-1">
          Total estimado: <span className="font-bold text-slate-700">{totalCost.toFixed(2)}€</span>
        </div>
      )}
    </div>
  );
};
