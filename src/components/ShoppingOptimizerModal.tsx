import React, { useState } from 'react';
import {
  Sparkles,
  Store,
  ShoppingCart,
  TrendingDown,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import type { OptimizedBasketPlan, Recipe } from '../types';
import { generateOptimizedShoppingPlans } from '../services/shoppingOptimizer';

interface ShoppingOptimizerModalProps {
  neededIngredients: { name: string; quantity: number; unit: string }[];
  recipeSource?: Recipe;
  onApplyPlanToShoppingList: (plan: OptimizedBasketPlan) => void;
  onClose: () => void;
}

export const ShoppingOptimizerModal: React.FC<ShoppingOptimizerModalProps> = ({
  neededIngredients,
  recipeSource,
  onApplyPlanToShoppingList,
  onClose,
}) => {
  const plans = generateOptimizedShoppingPlans(neededIngredients);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');

  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Comparador y Optimizador de Compra
              </h2>
              <p className="text-xs text-emerald-100">
                {recipeSource
                  ? `Para cocinar "${recipeSource.title}" (${neededIngredients.length} ingredientes)`
                  : `Calculando las mejores opciones para tus ${neededIngredients.length} ingredientes`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Planes Generados */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 sm:p-3 overflow-x-auto flex gap-2 no-scrollbar">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-3 rounded-2xl border text-left shrink-0 min-w-[190px] transition ${
                selectedPlanId === plan.id
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500 shadow-sm'
                  : 'bg-white/70 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">{plan.title}</span>
                {selectedPlanId === plan.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-extrabold text-emerald-700">{plan.totalCost.toFixed(2)}€</span>
                <span className="text-[11px] text-slate-400">
                  {plan.totalStores === 1 ? '1 parada' : `${plan.totalStores} súper(s)`}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detalle del plan seleccionado */}
        {activePlan && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950">{activePlan.title}</h4>
                <p className="text-xs text-emerald-800 mt-0.5">{activePlan.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {activePlan.stores.map((store) => (
                <div key={store.supermarketId} className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{store.supermarketName}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700">
                      Subtotal: {store.storeTotal.toFixed(2)}€
                    </span>
                  </div>

                  {/* Lista de productos a comprar en este supermercado */}
                  <div className="divide-y divide-slate-50 text-xs">
                    {store.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-slate-800 block">{item.productName}</span>
                          <span className="text-[11px] text-slate-400">
                            Para receta: {item.recipeIngredient} ({item.neededQuantity} {item.unit})
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-800 text-xs block">{item.subtotal.toFixed(2)}€</span>
                          <span className="text-[10px] text-slate-400">({item.unitPrice.toFixed(2)}€/ud)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pie y acción para volcar a la lista de la compra */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Actualiza tu lista con los precios y tiendas seleccionadas <strong>sin duplicar</strong> productos.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => onApplyPlanToShoppingList(activePlan)}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Asignar este plan ({activePlan?.totalCost.toFixed(2)}€)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
