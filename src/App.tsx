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
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PantryItem, ShoppingItem, Recipe, Category } from './types';
import { INITIAL_RECIPES, guessCategory, guessUnit, getDefaultExpiryDate } from './mockData';
import { parseReceiptText, convertToPantryItem, type ParsedTicketItem } from './receiptParser';

const STORAGE_KEY_PANTRY = 'estudiante_app_pantry';
const STORAGE_KEY_SHOPPING = 'estudiante_app_shopping';
const STORAGE_KEY_RECIPES = 'estudiante_app_recipes';

const CATEGORIES: { id: Category | 'todos'; label: string; emoji: string }[] = [
  { id: 'todos', label: 'Todos', emoji: '✨' },
  { id: 'carne-pescado', label: 'Carne / Pescado', emoji: '🥩' },
  { id: 'fruta-verdura', label: 'Fruta / Verdura', emoji: '🍎' },
  { id: 'lacteos', label: 'Lácteos / Huevos', emoji: '🧀' },
  { id: 'despensa', label: 'Despensa / Pasta', emoji: '🥫' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🧃' },
  { id: 'congelados', label: 'Congelados', emoji: '🧊' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'frigo' | 'compra' | 'recetas' | 'ticket'>('frigo');

  // Filter states
  const [pantryFilter, setPantryFilter] = useState<Category | 'todos'>('todos');
  const [recipeFilter, setRecipeFilter] = useState<Category | 'todos'>('todos');

  // Modal create recipe state
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newRecipeTime, setNewRecipeTime] = useState(15);
  const [newRecipeDifficulty, setNewRecipeDifficulty] = useState<'fácil' | 'medio' | 'difícil'>('fácil');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState<string>(''); // multiline name, qty, unit

  // Helper date offset
  const getOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Calculate days remaining until expiry
  const getDaysRemaining = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // State: Pantry with localStorage persistence
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PANTRY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'p1', name: 'Huevos Camperos', category: 'lacteos', quantity: 6, unit: 'uds', price: 2.45, expiryDate: getOffsetDate(12), addedAt: new Date().toISOString() },
      { id: 'p2', name: 'Leche Semidesnatada', category: 'lacteos', quantity: 2, unit: 'L', price: 1.95, expiryDate: getOffsetDate(2), addedAt: new Date().toISOString() },
      { id: 'p3', name: 'Pechuga de Pollo', category: 'carne-pescado', quantity: 400, unit: 'g', price: 4.20, expiryDate: getOffsetDate(1), addedAt: new Date().toISOString() },
      { id: 'p4', name: 'Tomate Frito', category: 'despensa', quantity: 1, unit: 'g', price: 0.85, expiryDate: getOffsetDate(90), addedAt: new Date().toISOString() },
      { id: 'p5', name: 'Pasta Macarrones', category: 'despensa', quantity: 400, unit: 'g', price: 0.90, expiryDate: getOffsetDate(180), addedAt: new Date().toISOString() },
      { id: 'p6', name: 'Atún en lata', category: 'carne-pescado', quantity: 3, unit: 'uds', price: 2.10, expiryDate: getOffsetDate(240), addedAt: new Date().toISOString() },
    ];
  });

  // State: Shopping List with localStorage persistence
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHOPPING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 's1', name: 'Patatas', category: 'fruta-verdura', quantity: 1, unit: 'kg', estimatedPrice: 1.60, checked: false },
      { id: 's2', name: 'Cebolla', category: 'fruta-verdura', quantity: 2, unit: 'uds', estimatedPrice: 1.10, checked: false },
      { id: 's3', name: 'Queso Rallado', category: 'lacteos', quantity: 1, unit: 'uds', estimatedPrice: 1.85, checked: false },
    ];
  });

  // State: Custom Recipes with localStorage persistence
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECIPES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_RECIPES;
  });

  // Inputs for quick additions
  const [quickShoppingName, setQuickShoppingName] = useState('');
  const [quickShoppingPrice, setQuickShoppingPrice] = useState<string>('');
  
  const [quickPantryName, setQuickPantryName] = useState('');
  const [quickPantryQty, setQuickPantryQty] = useState(1);
  const [quickPantryCategory, setQuickPantryCategory] = useState<Category>('otros');
  const [quickPantryPrice, setQuickPantryPrice] = useState<string>('');
  const [quickPantryExpiry, setQuickPantryExpiry] = useState<string>('');

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  // Handle Quick Add to Shopping List
  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickShoppingName.trim()) return;

    const price = quickShoppingPrice ? parseFloat(quickShoppingPrice.replace(',', '.')) : undefined;

    const newItem: ShoppingItem = {
      id: 'shop_' + Date.now(),
      name: quickShoppingName.trim(),
      category: guessCategory(quickShoppingName),
      quantity: 1,
      unit: guessUnit(quickShoppingName),
      estimatedPrice: isNaN(price || 0) ? undefined : price,
      checked: false,
    };

    setShoppingList([newItem, ...shoppingList]);
    setQuickShoppingName('');
    setQuickShoppingPrice('');
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
      price: item.estimatedPrice,
      expiryDate: getDefaultExpiryDate(item.name),
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

    const price = quickPantryPrice ? parseFloat(quickPantryPrice.replace(',', '.')) : undefined;
    const cat = quickPantryCategory === 'otros' ? guessCategory(quickPantryName) : quickPantryCategory;
    const expiry = quickPantryExpiry || getDefaultExpiryDate(quickPantryName);

    const newItem: PantryItem = {
      id: 'pantry_' + Date.now(),
      name: quickPantryName.trim(),
      category: cat,
      quantity: Number(quickPantryQty) || 1,
      unit: guessUnit(quickPantryName),
      price: isNaN(price || 0) ? undefined : price,
      expiryDate: expiry,
      addedAt: new Date().toISOString(),
    };

    setPantry([newItem, ...pantry]);
    setQuickPantryName('');
    setQuickPantryQty(1);
    setQuickPantryPrice('');
    setQuickPantryExpiry('');
  };

  // Update Pantry Item Quantity
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

  // Remove Custom Recipe
  const removeRecipe = (id: string) => {
    if (window.confirm('¿Quieres eliminar esta receta?')) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  // Add Custom User Recipe
  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeTitle.trim() || !newRecipeIngredients.trim()) return;

    // Parse ingredients from multiline input:
    // e.g. "Huevos, 2, uds" or just "Huevos" or "Pollo, 200, g"
    const parsedIngredients = newRecipeIngredients
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const qty = parts[1] ? parseFloat(parts[1]) || 1 : 1;
        const unit = parts[2] || guessUnit(name);
        return { name, quantity: qty, unit };
      });

    const newRecipe: Recipe = {
      id: 'rec_' + Date.now(),
      title: newRecipeTitle.trim(),
      description: newRecipeDesc.trim() || 'Receta propia añadida por ti.',
      cookingTimeMinutes: Number(newRecipeTime) || 15,
      difficulty: newRecipeDifficulty,
      ingredients: parsedIngredients,
      steps: ['Preparar y mezclar los ingredientes según tu gusto.'],
    };

    setRecipes([newRecipe, ...recipes]);
    setShowRecipeModal(false);
    setNewRecipeTitle('');
    setNewRecipeDesc('');
    setNewRecipeIngredients('');
    confetti({ particleCount: 60, spread: 70 });
  };

  // Process Mock / Demo Ticket
  const handleLoadDemoTicket = () => {
    const demo = `MERCADONA S.A.
1 HUEVOS CAMPEROS L 12U 2.45
2 LECHE ENTERA 1L 1.95
1 PLATANO DE CANARIAS 1.80
1 PECHUGA POLLO FILETES 4.50
1 TOMATE FRITO BRICK 0.85
1 PASTA MACARRONES 500G 0.90
TOTAL 12.45 €`;
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

  // Recipe evaluation: takes ingredients availability + urgency of expiring ingredients
  const evaluateRecipe = (recipe: Recipe) => {
    let availableCount = 0;
    let urgentIngredients: { name: string; days: number }[] = [];

    recipe.ingredients.forEach(req => {
      const match = pantry.find(p => p.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(p.name.toLowerCase()));
      if (match && match.quantity >= req.quantity) {
        availableCount++;
        const days = getDaysRemaining(match.expiryDate);
        if (days !== null && days <= 3) {
          urgentIngredients.push({ name: match.name, days });
        }
      }
    });

    const percentage = Math.round((availableCount / recipe.ingredients.length) * 100);
    const urgencyScore = (urgentIngredients.length * 30) + percentage;

    return {
      availableCount,
      totalCount: recipe.ingredients.length,
      percentage,
      urgentIngredients,
      urgencyScore
    };
  };

  // Filter and sort pantry
  const filteredPantry = pantry
    .filter(item => pantryFilter === 'todos' || item.category === pantryFilter)
    .sort((a, b) => {
      const daysA = getDaysRemaining(a.expiryDate) ?? 999;
      const daysB = getDaysRemaining(b.expiryDate) ?? 999;
      return daysA - daysB;
    });

  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter(recipe => {
      if (recipeFilter === 'todos') return true;
      // Check if recipe has any ingredient of the selected category
      return recipe.ingredients.some(ing => guessCategory(ing.name) === recipeFilter);
    })
    .sort((a, b) => {
      const evalA = evaluateRecipe(a);
      const evalB = evaluateRecipe(b);
      return evalB.urgencyScore - evalA.urgencyScore;
    });

  // Calculate totals
  const totalPantryValue = pantry.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalShoppingEstimate = shoppingList.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

  // Expiring soon items in pantry (<= 3 days)
  const expiringSoonCount = pantry.filter(item => {
    const d = getDaysRemaining(item.expiryDate);
    return d !== null && d <= 3;
  }).length;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span>🍳</span> NeveraEstudiante
            </h1>
            <p className="text-xs text-emerald-100">Control de frigo, compras y recetas</p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-emerald-500/40 border border-emerald-400/50 px-2.5 py-1 rounded-full font-medium inline-block">
              {pantry.length} prods
            </span>
            {totalPantryValue > 0 && (
              <p className="text-[11px] text-emerald-200 mt-1 font-semibold">
                Valor: {totalPantryValue.toFixed(2)}€
              </p>
            )}
          </div>
        </div>

        {/* Warning banner if items are expiring soon */}
        {expiringSoonCount > 0 && (
          <div
            onClick={() => setActiveTab('recetas')}
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* TAB 1: FRIGO / DESPENSA */}
        {activeTab === 'frigo' && (
          <div className="space-y-4">
            {/* Quick Add Form with Category, Price & Expiry */}
            <form onSubmit={handleAddPantryItem} className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Añadir al frigorífico
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Producto (ej: Leche, Huevos...)"
                  value={quickPantryName}
                  onChange={e => {
                    setQuickPantryName(e.target.value);
                    if (e.target.value.length > 2) {
                      setQuickPantryCategory(guessCategory(e.target.value));
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  min="1"
                  value={quickPantryQty}
                  onChange={e => setQuickPantryQty(Number(e.target.value))}
                  className="w-14 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  title="Cantidad"
                />
              </div>

              {/* Category selector + Price + Expiry */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <select
                  value={quickPantryCategory}
                  onChange={e => setQuickPantryCategory(e.target.value as Category)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="lacteos">🧀 Lácteos</option>
                  <option value="carne-pescado">🥩 Carne/Pescado</option>
                  <option value="fruta-verdura">🍎 Fruta/Verdura</option>
                  <option value="despensa">🥫 Despensa</option>
                  <option value="bebidas">🧃 Bebidas</option>
                  <option value="congelados">🧊 Congelados</option>
                  <option value="otros">🍽️ Otros</option>
                </select>

                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400">€</span>
                  <input
                    type="text"
                    placeholder="Precio"
                    value={quickPantryPrice}
                    onChange={e => setQuickPantryPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-6 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={quickPantryExpiry}
                    onChange={e => setQuickPantryExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-1.5 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    title="Fecha de caducidad"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl flex items-center justify-center font-medium transition active:scale-95 shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setPantryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                    pantryFilter === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Pantry List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-semibold text-slate-700">
                  {pantryFilter === 'todos' ? 'Todos los alimentos' : `Alimentos (${pantryFilter})`} ({filteredPantry.length})
                </h2>
                <span className="text-xs text-slate-500">Ordenados por caducidad</span>
              </div>

              {filteredPantry.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                  <Refrigerator className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">No hay productos en esta categoría</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba a seleccionar otra categoría o añadir un producto.</p>
                </div>
              ) : (
                filteredPantry.map(item => {
                  const daysLeft = getDaysRemaining(item.expiryDate);
                  const isExpired = daysLeft !== null && daysLeft < 0;
                  const isUrgent = daysLeft !== null && daysLeft <= 2 && !isExpired;
                  const isWarning = daysLeft !== null && daysLeft > 2 && daysLeft <= 5;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white p-3.5 rounded-2xl border transition shadow-xs flex items-center justify-between ${
                        isExpired
                          ? 'border-red-300 bg-red-50/30'
                          : isUrgent
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200/80 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {item.category === 'fruta-verdura' ? '🍎' :
                           item.category === 'carne-pescado' ? '🥩' :
                           item.category === 'lacteos' ? '🧀' :
                           item.category === 'despensa' ? '🥫' :
                           item.category === 'bebidas' ? '🧃' :
                           item.category === 'congelados' ? '🧊' : '🍽️'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                            {item.price && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {item.price.toFixed(2)}€
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500">
                              {item.quantity} {item.unit}
                            </p>

                            {/* Caducidad tag */}
                            {daysLeft !== null && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isExpired
                                    ? 'bg-red-100 text-red-700'
                                    : isUrgent
                                    ? 'bg-amber-100 text-amber-800'
                                    : isWarning
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Clock className="w-2.5 h-2.5" />
                                {isExpired
                                  ? `Caducó hace ${Math.abs(daysLeft)}d`
                                  : daysLeft === 0
                                  ? 'Caduca hoy'
                                  : daysLeft === 1
                                  ? 'Caduca mañana'
                                  : `Caduca en ${daysLeft} días`}
                              </span>
                            )}
                          </div>
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
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LISTA DE LA COMPRA */}
        {activeTab === 'compra' && (
          <div className="space-y-4">
            {/* Quick Add Form */}
            <form onSubmit={handleAddShoppingItem} className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Añadir a la lista de compra
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: Leche, Pasta, Yogures..."
                  value={quickShoppingName}
                  onChange={e => setQuickShoppingName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Precio aprox €"
                  value={quickShoppingPrice}
                  onChange={e => setQuickShoppingPrice(e.target.value)}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center justify-center font-medium transition active:scale-95 shadow-xs"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Shopping List Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700">Por comprar ({shoppingList.length})</h2>
                  {totalShoppingEstimate > 0 && (
                    <span className="text-xs text-slate-500 font-medium">
                      Estimado: ~{totalShoppingEstimate.toFixed(2)}€
                    </span>
                  )}
                </div>
                {shoppingList.some(i => i.checked) && (
                  <button
                    onClick={handleTransferCheckedToPantry}
                    className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-full transition flex items-center gap-1"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Pasar al frigo
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
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.name}
                          </span>
                          {item.estimatedPrice && (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.estimatedPrice.toFixed(2)}€
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">({item.category})</span>
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
                  Lee productos, precios y calcula fechas de caducidad estimadas de tu compra.
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
                  <span className="text-xs font-semibold text-emerald-700">
                    Total: {previewItems.reduce((acc, i) => acc + (i.price || 0), 0).toFixed(2)}€
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {previewItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Caducidad aprox: {getDefaultExpiryDate(item.name)}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.price && (
                          <div className="font-bold text-emerald-700">{item.price.toFixed(2)}€</div>
                        )}
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium text-[10px]">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddTicketItemsToPantry}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Añadir todo a mi nevera con caducidades
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RECETAS FILTRABLES Y CREACIÓN DE RECETAS */}
        {activeTab === 'recetas' && (
          <div className="space-y-4">
            {/* Top Bar with Add Recipe Button */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Recetas ({recipes.length})
                </h2>
                <p className="text-xs text-amber-100 mt-0.5">
                  Priorizando lo que caduca antes.
                </p>
              </div>
              <button
                onClick={() => setShowRecipeModal(true)}
                className="bg-white text-orange-600 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm hover:bg-orange-50 transition active:scale-95"
              >
                <Plus className="w-4 h-4" /> Crear receta
              </button>
            </div>

            {/* Recipe Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setRecipeFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                    recipeFilter === cat.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Recipes List */}
            <div className="space-y-3">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                  <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">No hay recetas con ingredientes de esta categoría</p>
                  <button
                    onClick={() => setShowRecipeModal(true)}
                    className="mt-2 text-xs text-amber-600 font-semibold underline"
                  >
                    + Añadir tu propia receta ahora
                  </button>
                </div>
              ) : (
                filteredRecipes.map(recipe => {
                  const evalResult = evaluateRecipe(recipe);
                  const canCookFully = evalResult.percentage === 100;
                  const hasUrgent = evalResult.urgentIngredients.length > 0;

                  return (
                    <div
                      key={recipe.id}
                      className={`bg-white rounded-2xl border p-4 transition shadow-xs ${
                        hasUrgent
                          ? 'border-amber-400 ring-2 ring-amber-500/20'
                          : canCookFully
                          ? 'border-emerald-400 ring-2 ring-emerald-500/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-800 text-sm">{recipe.title}</h3>
                            {hasUrgent && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> ¡Aprovecha lo que caduca!
                              </span>
                            )}
                            {canCookFully && !hasUrgent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                ¡Listo para hacer!
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{recipe.description}</p>
                        </div>

                        {/* Delete custom recipe */}
                        <button
                          onClick={() => removeRecipe(recipe.id)}
                          className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition"
                          title="Eliminar receta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Urgent alert for this recipe */}
                      {hasUrgent && (
                        <div className="mt-2.5 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl p-2 text-xs flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Usa <strong>{evalResult.urgentIngredients.map(i => `${i.name} (en ${i.days}d)`).join(', ')}</strong> antes de que se estropee.
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {recipe.cookingTimeMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> {recipe.difficulty}
                        </span>
                        <span className={`font-semibold ${canCookFully ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {evalResult.availableCount}/{evalResult.totalCount} ingredientes
                        </span>
                      </div>

                      {/* Ingredients summary */}
                      <div className="mt-3 bg-slate-50 p-2.5 rounded-xl">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Ingredientes necesarios:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.ingredients.map((ing, i) => {
                            const match = pantry.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(p.name.toLowerCase()));
                            const hasIt = !!match && match.quantity >= ing.quantity;
                            const daysLeft = match ? getDaysRemaining(match.expiryDate) : null;

                            return (
                              <span
                                key={i}
                                className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                  hasIt
                                    ? daysLeft !== null && daysLeft <= 3
                                      ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-800 font-medium'
                                    : 'bg-rose-100 text-rose-800 line-through'
                                }`}
                              >
                                {ing.name} ({ing.quantity} {ing.unit})
                                {hasIt && daysLeft !== null && daysLeft <= 3 && (
                                  <span className="text-[9px] text-amber-700 bg-amber-200/60 px-1 rounded">
                                    {daysLeft <= 0 ? 'hoy' : `${daysLeft}d`}
                                  </span>
                                )}
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
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREAR NUEVA RECETA */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" /> Nueva Receta
              </h3>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nombre del plato</label>
                <input
                  type="text"
                  placeholder="Ej: Macarrones con queso y bacon"
                  value={newRecipeTitle}
                  onChange={e => setNewRecipeTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Descripción breve</label>
                <input
                  type="text"
                  placeholder="Ej: Comida rica y rápida para cenar"
                  value={newRecipeDesc}
                  onChange={e => setNewRecipeDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tiempo (min)</label>
                  <input
                    type="number"
                    value={newRecipeTime}
                    onChange={e => setNewRecipeTime(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Dificultad</label>
                  <select
                    value={newRecipeDifficulty}
                    onChange={e => setNewRecipeDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="fácil">Fácil</option>
                    <option value="medio">Medio</option>
                    <option value="difícil">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Ingredientes (uno por línea: <span className="font-normal text-slate-400">Nombre, Cantidad, Unidad</span>)
                </label>
                <textarea
                  rows={4}
                  placeholder={`Pasta, 150, g\nTomate frito, 100, g\nQueso, 50, g`}
                  value={newRecipeIngredients}
                  onChange={e => setNewRecipeIngredients(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Ejemplo: si escribes "Huevos, 2, uds", descontará 2 huevos del frigo al cocinar.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Guardar receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
