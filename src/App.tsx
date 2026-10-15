import React, { useState, useEffect } from 'react';
import {
  Refrigerator,
  ShoppingCart,
  ChefHat,
  ScanLine,
  Plus,
  Trash2,
  Minus,
  CheckCircle2,
  Circle,
  Sparkles,
  Camera,
  Upload,
  Check,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PantryItem, ShoppingItem, Recipe } from './types';
import { INITIAL_RECIPES, guessCategory, guessUnit } from './mockData';
import { parseReceiptText, convertToPantryItem, type ParsedTicketItem } from './receiptParser';

const STORAGE_KEY_PANTRY = 'estudiante_app_pantry';
const STORAGE_KEY_SHOPPING = 'estudiante_app_shopping';

export default function App() {
  const [activeTab, setActiveTab] = useState<'frigo' | 'compra' | 'recetas' | 'ticket'>('frigo');

  // State: Pantry
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PANTRY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'p1', name: 'Huevos Camperos', category: 'lacteos', quantity: 6, unit: 'uds', addedAt: new Date().toISOString() },
      { id: 'p2', name: 'Leche Semidesnatada', category: 'lacteos', quantity: 2, unit: 'L', addedAt: new Date().toISOString() },
      { id: 'p3', name: 'Tomate Frito', category: 'despensa', quantity: 1, unit: 'g', addedAt: new Date().toISOString() },
      { id: 'p4', name: 'Pasta Macarrones', category: 'despensa', quantity: 400, unit: 'g', addedAt: new Date().toISOString() },
      { id: 'p5', name: 'Atún en lata', category: 'carne-pescado', quantity: 3, unit: 'uds', addedAt: new Date().toISOString() },
    ];
  });

  // State: Shopping List
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHOPPING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 's1', name: 'Patatas', category: 'fruta-verdura', quantity: 1, unit: 'kg', checked: false },
      { id: 's2', name: 'Cebolla', category: 'fruta-verdura', quantity: 2, unit: 'uds', checked: false },
      { id: 's3', name: 'Pechuga de Pollo', category: 'carne-pescado', quantity: 500, unit: 'g', checked: false },
    ];
  });

  // State: Recipes
  const [recipes] = useState<Recipe[]>(INITIAL_RECIPES);

  // Inputs for quick additions
  const [quickShoppingName, setQuickShoppingName] = useState('');
  const [quickPantryName, setQuickPantryName] = useState('');
  const [quickPantryQty, setQuickPantryQty] = useState(1);

  // Ticket scan state
  const [previewItems, setPreviewItems] = useState<ParsedTicketItem[]>([]);
  const [ticketImagePreview, setTicketImagePreview] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PANTRY, JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shoppingList));
  }, [shoppingList]);


  // Handle Quick Add to Shopping List (Solo con el nombre)
  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickShoppingName.trim()) return;

    const newItem: ShoppingItem = {
      id: 'shop_' + Date.now(),
      name: quickShoppingName.trim(),
      category: guessCategory(quickShoppingName),
      quantity: 1,
      unit: guessUnit(quickShoppingName),
      checked: false,
    };

    setShoppingList([newItem, ...shoppingList]);
    setQuickShoppingName('');
  };

  // Toggle Shopping List Item Check
  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Move checked items to Pantry
  const handleTransferCheckedToPantry = () => {
    const checkedItems = shoppingList.filter(item => item.checked);
    if (checkedItems.length === 0) return;

    const newPantryItems: PantryItem[] = checkedItems.map(item => ({
      id: 'pantry_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      addedAt: new Date().toISOString(),
    }));

    setPantry(prev => [...newPantryItems, ...prev]);
    setShoppingList(prev => prev.filter(item => !item.checked));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  // Quick add direct to pantry
  const handleAddPantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPantryName.trim()) return;

    const newItem: PantryItem = {
      id: 'pantry_' + Date.now(),
      name: quickPantryName.trim(),
      category: guessCategory(quickPantryName),
      quantity: Number(quickPantryQty) || 1,
      unit: guessUnit(quickPantryName),
      addedAt: new Date().toISOString(),
    };

    setPantry([newItem, ...pantry]);
    setQuickPantryName('');
    setQuickPantryQty(1);
  };

  // Update Pantry Item Quantity (Gastar o Añadir)
  const updatePantryQuantity = (id: string, delta: number) => {
    setPantry(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  // Remove Pantry Item
  const removePantryItem = (id: string) => {
    setPantry(prev => prev.filter(item => item.id !== id));
  };

  // Process Mock / Demo Ticket
  const handleLoadDemoTicket = () => {
    const demo = `MERCADONA S.A.
1 HUEVOS CAMPEROS L 12U 2.40
2 LECHE ENTERA 1L 1.95
1 PLATANO DE CANARIAS 1.80
1 PECHUGA POLLO FILETES 4.50
1 TOMATE FRITO BRICK 0.85
1 PASTA MACARRONES 500G 0.90
TOTAL 12.40 €`;
    const parsed = parseReceiptText(demo);
    setPreviewItems(parsed);
  };

  // Image upload simulation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTicketImagePreview(reader.result as string);
        // Automatically simulate OCR reading for the demo
        handleLoadDemoTicket();
      };
      reader.readAsDataURL(file);
    }
  };

  // Add all detected items from ticket to pantry
  const handleAddTicketItemsToPantry = () => {
    if (previewItems.length === 0) return;

    const newItems = previewItems.map(item => convertToPantryItem(item));
    setPantry(prev => [...newItems, ...prev]);

    // Also auto-check or remove from shopping list if they were pending
    setShoppingList(prev =>
      prev.filter(shopItem => {
        const foundInTicket = previewItems.some(
          p => p.name.toLowerCase().includes(shopItem.name.toLowerCase()) ||
               shopItem.name.toLowerCase().includes(p.name.toLowerCase())
        );
        return !foundInTicket;
      })
    );

    setPreviewItems([]);
    setTicketImagePreview(null);
    setActiveTab('frigo');
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  // Cook Recipe & Deduct Ingredients
  const handleCookRecipe = (recipe: Recipe) => {
    let missing: string[] = [];

    // Check availability
    recipe.ingredients.forEach(req => {
      const match = pantry.find(p => p.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(p.name.toLowerCase()));
      if (!match || match.quantity < req.quantity) {
        missing.push(`${req.name} (necesitas ${req.quantity} ${req.unit})`);
      }
    });

    if (missing.length > 0) {
      const proceed = window.confirm(
        `Te faltan algunos ingredientes:\n- ${missing.join('\n- ')}\n\n¿Quieres cocinarla igualmente y descontar lo que tengas?`
      );
      if (!proceed) return;
    }

    // Deduct
    setPantry(prev => {
      const updated = [...prev];
      recipe.ingredients.forEach(req => {
        const idx = updated.findIndex(p => p.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(p.name.toLowerCase()));
        if (idx !== -1) {
          const newQty = Math.max(0, updated[idx].quantity - req.quantity);
          if (newQty === 0) {
            updated.splice(idx, 1);
          } else {
            updated[idx] = { ...updated[idx], quantity: newQty };
          }
        }
      });
      return updated;
    });

    confetti({ particleCount: 80, spread: 100 });
  };

  // Calculate recipes you can cook right now with your pantry
  const getRecipePantryMatch = (recipe: Recipe) => {
    let availableCount = 0;
    recipe.ingredients.forEach(req => {
      const match = pantry.find(p => p.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(p.name.toLowerCase()));
      if (match && match.quantity >= req.quantity) {
        availableCount++;
      }
    });
    return {
      availableCount,
      totalCount: recipe.ingredients.length,
      percentage: Math.round((availableCount / recipe.ingredients.length) * 100)
    };
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span>🍳</span> NeveraEstudiante
            </h1>
            <p className="text-xs text-emerald-100">Control de despensa, compras y recetas</p>
          </div>
          <span className="text-xs bg-emerald-500/40 border border-emerald-400/50 px-2.5 py-1 rounded-full font-medium">
            {pantry.length} prods. en frigo
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* TAB 1: FRIGO / DESPENSA */}
        {activeTab === 'frigo' && (
          <div className="space-y-4">
            {/* Quick Add Form */}
            <form onSubmit={handleAddPantryItem} className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                Añadir al frigorífico
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Leche, Huevos, Manzanas..."
                  value={quickPantryName}
                  onChange={e => setQuickPantryName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  min="1"
                  value={quickPantryQty}
                  onChange={e => setQuickPantryQty(Number(e.target.value))}
                  className="w-16 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center justify-center font-medium transition active:scale-95 shadow-xs"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Pantry List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-semibold text-slate-700">Lo que tienes guardado</h2>
                <span className="text-xs text-slate-500">Usa + / - para descontar</span>
              </div>

              {pantry.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                  <Refrigerator className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">¡Tu nevera está vacía!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Añade alimentos arriba o sube la foto de tu ticket de compra.
                  </p>
                </div>
              ) : (
                pantry.map(item => (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {item.category === 'fruta-verdura' ? '🍎' :
                         item.category === 'carne-pescado' ? '🥩' :
                         item.category === 'lacteos' ? '🧀' :
                         item.category === 'despensa' ? '🥫' :
                         item.category === 'bebidas' ? '🧃' : '🍽️'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-xs text-slate-500">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                    </div>

                    {/* Quick controls: - / + / delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updatePantryQuantity(item.id, -1)}
                        title="Gastar 1"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 flex items-center justify-center font-bold text-sm active:scale-95 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updatePantryQuantity(item.id, 1)}
                        title="Sumar 1"
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 flex items-center justify-center font-bold text-sm active:scale-95 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removePantryItem(item.id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center active:scale-95 transition ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LISTA DE LA COMPRA */}
        {activeTab === 'compra' && (
          <div className="space-y-4">
            {/* Quick Add Form: Solo con el nombre */}
            <form onSubmit={handleAddShoppingItem} className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                Añadir rápido solo con el nombre
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Leche, Pasta, Papel..."
                  value={quickShoppingName}
                  onChange={e => setQuickShoppingName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center justify-center font-medium transition active:scale-95 shadow-xs"
                >
                  <Plus className="w-5 h-5 mr-1" /> Añadir
                </button>
              </div>
            </form>

            {/* Shopping List Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-semibold text-slate-700">Por comprar ({shoppingList.length})</h2>
                {shoppingList.some(i => i.checked) && (
                  <button
                    onClick={handleTransferCheckedToPantry}
                    className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-full transition flex items-center gap-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Pasar marcados al frigo
                  </button>
                )}
              </div>

              {shoppingList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Lista de compra vacía</p>
                  <p className="text-xs text-slate-400 mt-1">Escribe lo que te hace falta para no olvidarlo en el súper.</p>
                </div>
              ) : (
                shoppingList.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleShoppingItem(item.id)}
                    className={`bg-white p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      item.checked ? 'border-emerald-300 bg-emerald-50/50 opacity-75' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">({item.category})</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShoppingList(prev => prev.filter(i => i.id !== item.id));
                      }}
                      className="text-slate-300 hover:text-red-500 p-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBIR TICKET DE COMPRA */}
        {activeTab === 'ticket' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Escanear Ticket de Compra</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sube una foto de tu ticket de Mercadona, Carrefour, Lidl, etc. para añadir todo automáticamente al frigo.
                </p>
              </div>

              {/* Upload button */}
              <div className="pt-2">
                <label className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl cursor-pointer font-medium text-sm transition shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Subir foto de ticket</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-xs text-slate-400 uppercase font-medium">o prueba un ejemplo</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                onClick={handleLoadDemoTicket}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-xl transition"
              >
                Cargar ticket de ejemplo (Mercadona)
              </button>
            </div>

            {/* Preview of Photo if uploaded */}
            {ticketImagePreview && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-2">Foto capturada:</p>
                <img
                  src={ticketImagePreview}
                  alt="Ticket preview"
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            {/* Detected Items from Ticket */}
            {previewItems.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Detectados {previewItems.length} alimentos</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {previewItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        {item.price && (
                          <span className="text-slate-400">({item.price.toFixed(2)}€)</span>
                        )}
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddTicketItemsToPantry}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Añadir todo a mi nevera
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RECETAS & QUÉ COCINAR */}
        {activeTab === 'recetas' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-sm">
              <h2 className="font-bold text-base flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> ¿Qué puedo cocinar hoy?
              </h2>
              <p className="text-xs text-amber-100 mt-1">
                Recetas calculadas según lo que tienes disponible en el frigorífico.
              </p>
            </div>

            <div className="space-y-3">
              {recipes.map(recipe => {
                const match = getRecipePantryMatch(recipe);
                const canCookFully = match.percentage === 100;

                return (
                  <div
                    key={recipe.id}
                    className={`bg-white rounded-2xl border p-4 transition shadow-xs ${
                      canCookFully ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">{recipe.title}</h3>
                          {canCookFully && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              ¡Listo para hacer!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{recipe.description}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {recipe.cookingTimeMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {recipe.difficulty}
                      </span>
                      <span className={`font-semibold ${canCookFully ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {match.availableCount}/{match.totalCount} ingredientes
                      </span>
                    </div>

                    {/* Ingredients summary */}
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Ingredientes necesarios:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.ingredients.map((ing, i) => {
                          const hasIt = pantry.some(p => p.name.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(p.name.toLowerCase()));
                          return (
                            <span
                              key={i}
                              className={`text-[11px] px-2 py-0.5 rounded-md ${
                                hasIt ? 'bg-emerald-100 text-emerald-800 font-medium' : 'bg-rose-100 text-rose-800 line-through'
                              }`}
                            >
                              {ing.name} ({ing.quantity} {ing.unit})
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-3 pt-2 flex gap-2">
                      <button
                        onClick={() => handleCookRecipe(recipe)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          canCookFully
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        <ChefHat className="w-4 h-4" /> Cocinar y descontar ingredientes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Tab Bar */}
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
          {shoppingList.length > 0 && (
            <span className="absolute top-1 right-2.5 w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {shoppingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ticket')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            activeTab === 'ticket' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span className="text-[11px] mt-1">Ticket OCR</span>
        </button>

        <button
          onClick={() => setActiveTab('recetas')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            activeTab === 'recetas' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ChefHat className="w-5 h-5" />
          <span className="text-[11px] mt-1">Recetas</span>
        </button>
      </nav>
    </div>
  );
}
