import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Sparkles, Store, Filter } from 'lucide-react';
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
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('todos');

  const hasChecked = shoppingList.some(item => item.checked);
  const totalCost = shoppingList.reduce((acc, item) => acc + (item.estimatedPrice || 0), 0);

  // Extraer tiendas asignadas únicas en la lista
  const assignedStores = Array.from(
    new Set(shoppingList.map(item => item.assignedSupermarket).filter(Boolean))
  ) as string[];

  // Filtrado por tienda seleccionada
  const filteredList = shoppingList.filter(item => {
    if (selectedStoreFilter === 'todos') return true;
    if (selectedStoreFilter === 'sin-asignar') return !item.assignedSupermarket;
    return item.assignedSupermarket?.toLowerCase() === selectedStoreFilter.toLowerCase();
  });

  return (
    <div className="space-y-4">
      {/* Cabecera y acciones principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lista de la Compra</h2>
          <p className="text-xs text-slate-500">Apunta rápido lo que te falta y organiza en qué súper comprarlo</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {shoppingList.length > 0 && onOpenOptimizer && (
            <button
              onClick={onOpenOptimizer}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Organizar y Comparar Precios</span>
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

      {/* Formulario rápido para apuntar ingredientes */}
      <form onSubmit={onAddItem} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex gap-2">
        <input
          type="text"
          placeholder="Apunta algo rápido (ej: Huevos, Leche, Cebolla...)"
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

      {/* Filtro por supermercado asignado (si los hay) */}
      {assignedStores.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Ver:
          </span>
          <button
            onClick={() => setSelectedStoreFilter('todos')}
            className={`px-3 py-1 rounded-full font-semibold transition ${
              selectedStoreFilter === 'todos'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos ({shoppingList.length})
          </button>

          {assignedStores.map(store => (
            <button
              key={store}
              onClick={() => setSelectedStoreFilter(store)}
              className={`px-3 py-1 rounded-full font-semibold transition flex items-center gap-1 capitalize ${
                selectedStoreFilter === store
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>{store}</span>
            </button>
          ))}

          {shoppingList.some(item => !item.assignedSupermarket) && (
            <button
              onClick={() => setSelectedStoreFilter('sin-asignar')}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                selectedStoreFilter === 'sin-asignar'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Sin tienda fijada
            </button>
          )}
        </div>
      )}

      {/* Listado de artículos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {shoppingList.length === 0
              ? 'No tienes elementos en la lista de compra.'
              : 'No hay productos en esta tienda.'}
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                item.checked ? 'bg-emerald-50/40 text-slate-400 line-through' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => onToggleItem(item.id)}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${item.checked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {item.name}
                    </span>

                    {/* Insignia de tienda asignada */}
                    {item.assignedSupermarket && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Store className="w-2.5 h-2.5" />
                        {item.assignedSupermarket}
                      </span>
                    )}

                    {item.estimatedPrice !== undefined && item.estimatedPrice > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        {item.estimatedPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>

                  {item.assignedProductName && item.assignedProductName !== item.name && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Recomendado: {item.assignedProductName}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-slate-300 hover:text-red-500 p-1.5 transition"
                title="Eliminar de la lista"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {shoppingList.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>{shoppingList.filter(i => i.checked).length} de {shoppingList.length} en el carro</span>
          <span>
            Total estimado: <strong className="text-slate-800 text-sm font-bold">{totalCost.toFixed(2)}€</strong>
          </span>
        </div>
      )}
    </div>
  );
};
