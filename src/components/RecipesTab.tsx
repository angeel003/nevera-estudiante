import React, { useState } from 'react';
import {
  ChefHat,
  Plus,
  Clock,
  Users,
  Trash2,
  Minus,
  UtensilsCrossed,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ListOrdered
} from 'lucide-react';
import type { Recipe, PantryItem, Category } from '../types';
import { guessCategory } from '../mockData';
import { useDragScroll } from '../utils/useDragScroll';

interface RecipesTabProps {
  recipes: Recipe[];
  pantry: PantryItem[];
  recipeFilter: Category | 'todos';
  onFilterChange: (filter: Category | 'todos') => void;
  recipeServingsMap: Record<string, number>;
  onChangeServings: (recipeId: string, newServings: number) => void;
  onCookRecipe: (recipe: Recipe) => void;
  onRemoveRecipe: (id: string) => void;
  onOpenCreateModal: () => void;
  onOptimizeIngredients?: (recipe: Recipe, needed: { name: string; quantity: number; unit: string }[]) => void;
  evaluateRecipe: (recipe: Recipe) => {
    availableCount: number;
    totalCount: number;
    percentage: number;
    urgentIngredients: { name: string; days: number }[];
    urgencyScore: number;
  };
}

export const RecipesTab: React.FC<RecipesTabProps> = ({
  recipes,
  pantry,
  recipeFilter,
  onFilterChange,
  recipeServingsMap,
  onChangeServings,
  onCookRecipe,
  onRemoveRecipe,
  onOpenCreateModal,
  onOptimizeIngredients,
  evaluateRecipe
}) => {
  const [expandedStepsRecipeId, setExpandedStepsRecipeId] = useState<string | null>(null);
  const categoryScrollRef = useDragScroll<HTMLDivElement>();

  const getRecipeServings = (recipe: Recipe): number => {
    return recipeServingsMap[recipe.id] ?? recipe.servings ?? 1;
  };

  const filteredRecipes = recipes
    .filter(recipe => {
      if (recipeFilter === 'todos') return true;
      return recipe.ingredients.some(ing => guessCategory(ing.name) === recipeFilter);
    })
    .sort((a, b) => {
      const evalA = evaluateRecipe(a);
      const evalB = evaluateRecipe(b);
      return evalB.urgencyScore - evalA.urgencyScore;
    });

  return (
    <div className="space-y-4">
      {/* Cabecera y botón crear */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Recetas Sugeridas</h2>
          <p className="text-xs text-slate-500">Aprovecha lo que tienes y prioriza lo que caduca</p>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Receta</span>
        </button>
      </div>

      {/* Filtros rápidos por categoría de ingrediente con Drag Scroll */}
      <div
        ref={categoryScrollRef}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar drag-scroll"
      >
        {[
          { id: 'todos', label: 'Todas', emoji: '✨' },
          { id: 'despensa', label: 'Pasta / Arroz', emoji: '🥫' },
          { id: 'carne-pescado', label: 'Carne / Pescado', emoji: '🥩' },
          { id: 'lacteos', label: 'Lácteos / Huevos', emoji: '🧀' },
          { id: 'fruta-verdura', label: 'Verduras', emoji: '🍎' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => onFilterChange(cat.id as Category | 'todos')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              recipeFilter === cat.id
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Listado de recetas */}
      <div>
        {recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base text-slate-800 font-bold">No hay recetas guardadas en la base de datos</p>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
                Crea tu primera receta personalizada y se guardará directamente en tu base de datos Cloudflare D1.
              </p>
            </div>
            <button
              onClick={onOpenCreateModal}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition active:scale-95 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primera receta</span>
            </button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
            <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">No se encontraron recetas con este ingrediente</p>
            <p className="text-xs text-slate-400 mt-1">Prueba a seleccionar otra categoría o añade una nueva receta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRecipes.map(recipe => {
              const ev = evaluateRecipe(recipe);
              const currentServings = getRecipeServings(recipe);
              const baseServings = recipe.servings || 1;
              const factor = currentServings / baseServings;

              return (
                <div
                  key={recipe.id}
                  className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden flex flex-col justify-between ${
                    ev.urgentIngredients.length > 0 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                {/* Cabecera de la receta */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{recipe.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{recipe.description}</p>
                    </div>
                    <button
                      onClick={() => onRemoveRecipe(recipe.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition"
                      title="Eliminar receta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Insignias de tiempo, dificultad y raciones dinámicas */}
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {recipe.cookingTimeMinutes} min
                      </span>
                      {recipe.prepTimeMinutes !== undefined && recipe.prepTimeMinutes > 0 && (
                        <span className="text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md font-medium">
                          prep: {recipe.prepTimeMinutes}m
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium capitalize">
                        {recipe.difficulty}
                      </span>
                    </div>

                    {/* Selector de comensales / raciones */}
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-600 mr-1">Raciones:</span>
                      <button
                        onClick={() => onChangeServings(recipe.id, currentServings - 1)}
                        disabled={currentServings <= 1}
                        className="w-5 h-5 rounded bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 min-w-4 text-center">
                        {currentServings}
                      </span>
                      <button
                        onClick={() => onChangeServings(recipe.id, currentServings + 1)}
                        className="w-5 h-5 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Alerta de caducidad urgente */}
                  {ev.urgentIngredients.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center gap-2 text-xs text-amber-900">
                      <span className="text-base">🔥</span>
                      <div>
                        <strong>¡Aprovecha antes de que caduque!</strong> Usa:{' '}
                        {ev.urgentIngredients.map(u => `${u.name} (en ${u.days}d)`).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Checklist de ingredientes escalados */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Ingredientes necesarios:</span>
                      <span className={`font-bold ${ev.percentage === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {ev.availableCount} de {ev.totalCount} disponibles ({ev.percentage}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {recipe.ingredients.map((ing, i) => {
                        const scaledQty = Math.round(ing.quantity * factor * 10) / 10;
                        const match = pantry.find(
                          p => p.name.toLowerCase().includes(ing.name.toLowerCase()) ||
                               ing.name.toLowerCase().includes(p.name.toLowerCase())
                        );
                        const hasEnough = match && match.quantity >= scaledQty;

                        return (
                          <div
                            key={i}
                            className={`p-1.5 rounded-lg border flex items-center justify-between ${
                              hasEnough
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span className="truncate mr-1">{ing.name}</span>
                            <span className="font-bold shrink-0 text-[11px]">
                              {scaledQty} {ing.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Instrucciones y pasos paso a paso */}
                  {recipe.steps && recipe.steps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setExpandedStepsRecipeId(expandedStepsRecipeId === recipe.id ? null : recipe.id)}
                        className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center justify-between w-full py-1 transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
                          <span>Ver instrucciones paso a paso ({recipe.steps.length} pasos)</span>
                        </span>
                        {expandedStepsRecipeId === recipe.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedStepsRecipeId === recipe.id && (
                        <div className="mt-2 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 animate-fade-in">
                          {recipe.steps.map((st, sidx) => (
                            <div key={sidx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {sidx + 1}
                              </span>
                              <p className="flex-1 text-[11px] leading-relaxed">{st}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Botón Cocinar y botón Optimizar dónde comprar */}
                <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {onOptimizeIngredients && (
                    <button
                      onClick={() => {
                        const needed = recipe.ingredients.map(ing => ({
                          name: ing.name,
                          quantity: Math.round(ing.quantity * factor * 10) / 10,
                          unit: ing.unit,
                        }));
                        onOptimizeIngredients(recipe, needed);
                      }}
                      className="bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition active:scale-95"
                      title="Ver dónde comprar estos ingredientes más barato"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Comparar precios y súper</span>
                    </button>
                  )}

                  <button
                    onClick={() => onCookRecipe(recipe)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs ml-auto"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Cocinar ({currentServings}p)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
};
