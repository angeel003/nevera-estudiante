import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  PantryItem,
  ShoppingItem,
  Recipe,
  Category,
  TicketReviewItem,
  TicketSession,
  ProposedFoodItem,
  OptimizedBasketPlan
} from './types';
import {
  STORAGE_KEY_PANTRY,
  STORAGE_KEY_SHOPPING,
  STORAGE_KEY_RECIPES,
  STORAGE_KEY_TICKET_DRAFT,
  STORAGE_KEY_ADMIN_PROPOSALS,
  STORAGE_KEY_USER_ID,
  STORAGE_KEY_USER_EMAIL,
  ADMIN_EMAILS,
  getOffsetDate,
  getDaysRemaining
} from './utils/constants';
import { INITIAL_RECIPES, guessCategory, guessUnit, getDefaultExpiryDate } from './mockData';
import { parseReceiptText } from './receiptParser';
import { extractTextFromPdf } from './pdfParser';
import { detectSupermarketFromText, SUPERMARKET_CATALOGS } from './supermarkets';
import { detectDuplicateSuspicion } from './services/shoppingOptimizer';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PantryTab } from './components/PantryTab';
import { ShoppingTab } from './components/ShoppingTab';
import { TicketReviewTab } from './components/TicketReviewTab';
import { RecipesTab } from './components/RecipesTab';
import { EditPantryModal } from './components/EditPantryModal';
import { AddTicketItemModal } from './components/AddTicketItemModal';
import { RecipeModal } from './components/RecipeModal';
import { SupermarketPromptModal } from './components/SupermarketPromptModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ShoppingOptimizerModal } from './components/ShoppingOptimizerModal';
import { AuthModal } from './components/AuthModal';
import type { UserAccount } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'frigo' | 'compra' | 'recetas' | 'ticket'>('frigo');

  // Filter states
  const [pantryFilter, setPantryFilter] = useState<Category | 'todos'>('todos');
  const [recipeFilter, setRecipeFilter] = useState<Category | 'todos'>('todos');

  // Modals
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAddTicketItemModal, setShowAddTicketItemModal] = useState(false);
  const [editingPantryItem, setEditingPantryItem] = useState<PantryItem | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [optimizerIngredients, setOptimizerIngredients] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [optimizerRecipeSource, setOptimizerRecipeSource] = useState<Recipe | undefined>(undefined);

  // User account & session state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEY_USER_EMAIL) || 'angelhv2003@gmail.com';
    const savedId = localStorage.getItem(STORAGE_KEY_USER_ID) || 'usr_angel_admin';
    const isAdminUser = ADMIN_EMAILS.includes(savedEmail.toLowerCase().trim());
    return {
      id: savedId,
      email: savedEmail,
      name: savedEmail.split('@')[0],
      isAdmin: isAdminUser,
    };
  });

  const userId = currentUser?.id || 'usr_guest';
  const isAdmin = currentUser?.isAdmin || false;

  // Admin proposed food items list (with duplicate suspicion detector)
  const [adminProposals, setAdminProposals] = useState<ProposedFoodItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PROPOSALS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'prop_demo_1',
        userId: 'user_estudiante_12',
        userEmail: 'estudiante@universidad.es',
        name: 'Huevos Camperos L 12U',
        supermarket: 'mercadona',
        category: 'lacteos',
        unit: 'uds',
        price: 2.45,
        createdAt: new Date().toISOString(),
        status: 'pending',
        duplicateSuspect: {
          existingId: 'mercadona_huevos',
          existingName: 'Huevos Camperos',
          similarity: 92,
          reason: 'Mismo supermercado (Mercadona) y nombre prácticamente idéntico (92% de coincidencia).'
        }
      },
      {
        id: 'prop_demo_2',
        userId: 'user_juan_44',
        userEmail: 'juan@gmail.com',
        name: 'Tofu Natural Bio',
        supermarket: 'dia',
        category: 'despensa',
        unit: 'uds',
        price: 1.89,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
    ];
  });

  // Dynamic servings multiplier state per recipe (e.g. { 'r1': 2, 'r2': 3 })
  const [recipeServingsMap, setRecipeServingsMap] = useState<Record<string, number>>({});

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

  // Shopping input states
  const [quickShoppingName, setQuickShoppingName] = useState('');
  const [quickShoppingPrice, setQuickShoppingPrice] = useState('');

  // Ticket scan & review session state (persisted so user can leave and resume anytime)
  const [ticketSession, setTicketSession] = useState<TicketSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TICKET_DRAFT);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('mercadona');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Supermarket autodetection prompt state
  const [pendingTicketData, setPendingTicketData] = useState<{
    text: string;
    previewUrl?: string | null;
    detectedName?: string;
  } | null>(null);

  // Listen for Shared Ticket files from Web Share Target API
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.error('Service worker registration failed:', err);
      });
    }

    const checkSharedTickets = async () => {
      try {
        if ('caches' in window) {
          const cache = await caches.open('shared-ticket-cache');
          const fileResp = await cache.match('/shared-ticket-file');
          if (fileResp) {
            const blob = await fileResp.blob();
            const fileName = decodeURIComponent(fileResp.headers.get('x-file-name') || 'ticket');
            await cache.delete('/shared-ticket-file');
            
            const file = new File([blob], fileName, { type: blob.type });
            setActiveTab('ticket');
            await handleProcessTicketFile(file);
            return;
          }

          const textResp = await cache.match('/shared-ticket-text');
          if (textResp) {
            const data = await textResp.json();
            await cache.delete('/shared-ticket-text');
            if (data.text || data.title) {
              setActiveTab('ticket');
              handleTicketRawTextLoaded(`${data.title || ''}\n${data.text || ''}`, null);
            }
          }
        }
      } catch (err) {
        console.error('Error reading shared ticket cache:', err);
      }
    };

    checkSharedTickets();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (ticketSession) {
      localStorage.setItem(STORAGE_KEY_TICKET_DRAFT, JSON.stringify(ticketSession));
    } else {
      localStorage.removeItem(STORAGE_KEY_TICKET_DRAFT);
    }
  }, [ticketSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PANTRY, JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADMIN_PROPOSALS, JSON.stringify(adminProposals));
  }, [adminProposals]);

  // Shopping actions
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

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

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

  // Pantry actions
  const handleAddPantryItem = (newItem: PantryItem) => {
    // 1. Añadir a la nevera privada del usuario
    setPantry([newItem, ...pantry]);

    // 2. Si es un alimento personalizado creado por el usuario, proponerlo a moderación de administradores
    // pero SIN que nadie más lo vea hasta ser aprobado
    const existingList: { id: string; name: string; supermarket: string; category?: Category; price?: number }[] = [];
    for (const [storeKey, cat] of Object.entries(SUPERMARKET_CATALOGS)) {
      for (const prod of Object.values(cat.patterns)) {
        existingList.push({
          id: `${storeKey}_${prod.normalizedName}`,
          name: prod.normalizedName,
          supermarket: cat.name,
          category: prod.category,
          price: prod.defaultPrice,
        });
      }
    }

    const suspect = detectDuplicateSuspicion(
      {
        name: newItem.name,
        supermarket: selectedSupermarket,
        category: newItem.category,
        unit: newItem.unit,
        price: newItem.price,
      },
      existingList
    );

    const proposal: ProposedFoodItem = {
      id: 'prop_' + Date.now(),
      userId,
      userEmail: 'mi_cuenta@app.local',
      name: newItem.name,
      supermarket: selectedSupermarket,
      category: newItem.category,
      unit: newItem.unit,
      price: newItem.price,
      createdAt: new Date().toISOString(),
      status: 'pending',
      duplicateSuspect: suspect,
    };

    setAdminProposals(prev => [proposal, ...prev]);
  };

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

  const removePantryItem = (id: string) => {
    setPantry(prev => prev.filter(item => item.id !== id));
  };

  const handleSavePantryItem = (updated: PantryItem) => {
    setPantry(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setEditingPantryItem(null);
  };

  // Recipe actions
  const removeRecipe = (id: string) => {
    if (window.confirm('¿Quieres eliminar esta receta?')) {
      setRecipes(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSaveRecipe = (newRecipe: Recipe) => {
    setRecipes([newRecipe, ...recipes]);
    setShowRecipeModal(false);
    confetti({ particleCount: 60, spread: 70 });
  };

  const getRecipeServings = (recipe: Recipe): number => {
    return recipeServingsMap[recipe.id] ?? recipe.servings ?? 1;
  };

  const changeRecipeServings = (recipeId: string, newServings: number) => {
    if (newServings < 1) return;
    setRecipeServingsMap(prev => ({ ...prev, [recipeId]: newServings }));
  };

  const evaluateRecipe = (recipe: Recipe) => {
    const currentServings = getRecipeServings(recipe);
    const baseServings = recipe.servings || 1;
    const factor = currentServings / baseServings;

    let availableCount = 0;
    let urgentIngredients: { name: string; days: number }[] = [];

    recipe.ingredients.forEach(req => {
      const neededQty = Math.round(req.quantity * factor * 10) / 10;
      const match = pantry.find(
        p => p.name.toLowerCase().includes(req.name.toLowerCase()) ||
             req.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (match && match.quantity >= neededQty) {
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

  const handleCookRecipe = (recipe: Recipe) => {
    const currentServings = getRecipeServings(recipe);
    const baseServings = recipe.servings || 1;
    const factor = currentServings / baseServings;

    let missing: string[] = [];

    recipe.ingredients.forEach(req => {
      const neededQty = Math.round(req.quantity * factor * 10) / 10;
      const match = pantry.find(
        p => p.name.toLowerCase().includes(req.name.toLowerCase()) ||
             req.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (!match || match.quantity < neededQty) {
        missing.push(`${req.name} (necesitas ${neededQty} ${req.unit})`);
      }
    });

    if (missing.length > 0) {
      const proceed = window.confirm(
        `Para ${currentServings} persona${currentServings > 1 ? 's' : ''} te faltan ingredientes:\n- ${missing.join('\n- ')}\n\n¿Quieres cocinarla igualmente y descontar lo que tengas?`
      );
      if (!proceed) return;
    }

    setPantry(prev => {
      const updated = [...prev];
      recipe.ingredients.forEach(req => {
        const neededQty = Math.round(req.quantity * factor * 10) / 10;
        const idx = updated.findIndex(
          p => p.name.toLowerCase().includes(req.name.toLowerCase()) ||
               req.name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (idx !== -1) {
          const newQty = Math.max(0, updated[idx].quantity - neededQty);
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

  // Ticket processing with automatic supermarket detection & matching
  const handleTicketRawTextLoaded = (rawText: string, imagePreview?: string | null) => {
    // 1. Intentar autodetectar el supermercado en el texto del ticket
    const detection = detectSupermarketFromText(rawText);

    if (detection.confidence === 'high') {
      // Reconocido automáticamente (Mercadona, Día, Carrefour, Lidl, Alcampo, Eroski, etc.)
      setSelectedSupermarket(detection.supermarketId);
      startTicketSession(rawText, imagePreview, detection.supermarketId);
    } else {
      // No reconocido con certeza: abrir modal para preguntar al usuario
      setPendingTicketData({
        text: rawText,
        previewUrl: imagePreview,
        detectedName: detection.confidence === 'medium' ? detection.name : undefined
      });
    }
  };

  const handleConfirmSupermarketPrompt = (supermarketId: string, customName?: string) => {
    if (!pendingTicketData) return;
    const finalSupermarket = supermarketId === 'custom' && customName ? customName : supermarketId;
    setSelectedSupermarket(finalSupermarket);
    startTicketSession(pendingTicketData.text, pendingTicketData.previewUrl, finalSupermarket);
    setPendingTicketData(null);
  };

  const startTicketSession = (rawText: string, imagePreview?: string | null, supermarketId?: string) => {
    const sm = supermarketId || selectedSupermarket;
    const parsed = parseReceiptText(rawText, sm);
    const reviewItems: TicketReviewItem[] = parsed.map((item, index) => ({
      id: 'rev_' + Date.now() + '_' + index,
      rawText: item.rawText || item.name,
      name: item.name,
      category: item.category || guessCategory(item.name),
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      expiryDate: getDefaultExpiryDate(item.name),
      isFrozen: false,
      status: 'pending'
    }));

    setTicketSession({
      id: 'sess_' + Date.now(),
      supermarket: sm,
      createdAt: new Date().toISOString(),
      imagePreview: imagePreview || null,
      items: reviewItems
    });
  };

  const handleLoadDemoTicket = () => {
    const demo = `MERCADONA S.A.
1 HUEVOS CAMPEROS L 12U 2.45
2 LECHE ENTERA 1L 1.95
1 PLATANO DE CANARIAS 1.80
1 PECHUGA POLLO FILETES 4.50
1 TOMATE FRITO BRICK 0.85
1 PASTA MACARRONES 500G 0.90
1 PAPEL HIGIENICO 12R 3.10
TOTAL 15.55 €`;
    handleTicketRawTextLoaded(demo, null);
  };

  const handleProcessTicketFile = async (file: File) => {
    setIsProcessingFile(true);
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfText = await extractTextFromPdf(file);
        if (pdfText.trim().length > 10) {
          handleTicketRawTextLoaded(pdfText, null);
        } else {
          handleLoadDemoTicket();
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const previewUrl = reader.result as string;
          const demo = `MERCADONA S.A.
1 HUEVOS CAMPEROS L 12U 2.45
2 LECHE ENTERA 1L 1.95
1 PLATANO DE CANARIAS 1.80
1 PECHUGA POLLO FILETES 4.50
1 TOMATE FRITO BRICK 0.85
1 PASTA MACARRONES 500G 0.90
1 PAPEL HIGIENICO 12R 3.10
TOTAL 15.55 €`;
          handleTicketRawTextLoaded(demo, previewUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error processing ticket file:', err);
      alert('Hubo un problema al leer el archivo. Inténtalo de nuevo.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessTicketFile(file);
    }
  };

  const updateTicketReviewItem = (id: string, updates: Partial<TicketReviewItem>) => {
    if (!ticketSession) return;
    setTicketSession({
      ...ticketSession,
      items: ticketSession.items.map(item => item.id === id ? { ...item, ...updates } : item)
    });
  };

  const toggleItemVerified = (id: string) => {
    if (!ticketSession) return;
    setTicketSession({
      ...ticketSession,
      items: ticketSession.items.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'verified' ? 'pending' : 'verified';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    });
  };

  const discardTicketReviewItem = (id: string) => {
    if (!ticketSession) return;
    setTicketSession({
      ...ticketSession,
      items: ticketSession.items.filter(item => item.id !== id)
    });
  };

  const handleAddManualItemToTicket = (item: {
    name: string;
    quantity: number;
    unit: string;
    price?: number;
    category: Category;
  }) => {
    if (!ticketSession) return;

    const newItem: TicketReviewItem = {
      id: 'rev_' + Date.now(),
      rawText: 'Añadido manualmente',
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      expiryDate: getDefaultExpiryDate(item.name),
      isFrozen: false,
      status: 'verified'
    };

    setTicketSession({
      ...ticketSession,
      items: [...ticketSession.items, newItem]
    });
    setShowAddTicketItemModal(false);
  };

  const handleFinalizeTicket = (onlyVerified = false) => {
    if (!ticketSession) return;

    const toImport = onlyVerified
      ? ticketSession.items.filter(i => i.status === 'verified')
      : ticketSession.items.filter(i => i.status !== 'discarded');

    if (toImport.length === 0) {
      alert('No hay alimentos seleccionados para guardar en la nevera.');
      return;
    }

    const newPantryItems: PantryItem[] = toImport.map(item => ({
      id: 'pantry_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      expiryDate: item.expiryDate || getDefaultExpiryDate(item.name),
      isFrozen: item.isFrozen,
      addedAt: new Date().toISOString(),
    }));

    setPantry(prev => [...newPantryItems, ...prev]);

    setShoppingList(prev =>
      prev.filter(shopItem => {
        const found = toImport.some(
          p => p.name.toLowerCase().includes(shopItem.name.toLowerCase()) ||
               shopItem.name.toLowerCase().includes(p.name.toLowerCase())
        );
        return !found;
      })
    );

    if (onlyVerified && toImport.length < ticketSession.items.length) {
      setTicketSession({
        ...ticketSession,
        items: ticketSession.items.filter(i => i.status !== 'verified')
      });
      alert(`¡Se han añadido ${toImport.length} alimentos a tu nevera! El resto sigue guardado aquí para cuando quieras revisarlo.`);
    } else {
      setTicketSession(null);
      localStorage.removeItem(STORAGE_KEY_TICKET_DRAFT);
      setActiveTab('frigo');
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleDiscardTicketSession = () => {
    if (window.confirm('¿Quieres descartar esta revisión del ticket? Se borrarán los productos pendientes de este ticket.')) {
      setTicketSession(null);
      localStorage.removeItem(STORAGE_KEY_TICKET_DRAFT);
    }
  };

  // Admin actions
  const handleApproveProposal = (proposalId: string) => {
    setAdminProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, status: 'approved' } : p))
    );
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleRejectProposal = (proposalId: string) => {
    setAdminProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
    );
  };

  const handleMergeProposal = (proposalId: string, existingId: string) => {
    setAdminProposals(prev =>
      prev.map(p => (p.id === proposalId ? { ...p, status: 'approved' } : p))
    );
    alert(`Se ha registrado como variante/alias del producto existente (${existingId}).`);
  };

  // Optimizer actions
  const handleOpenOptimizerForRecipe = (recipe: Recipe, needed: { name: string; quantity: number; unit: string }[]) => {
    setOptimizerIngredients(needed);
    setOptimizerRecipeSource(recipe);
    setShowOptimizerModal(true);
  };

  const handleOpenOptimizerForShoppingList = () => {
    if (shoppingList.length === 0) return;
    const items = shoppingList.map(s => ({
      name: s.name,
      quantity: s.quantity,
      unit: s.unit,
    }));
    setOptimizerIngredients(items);
    setOptimizerRecipeSource(undefined);
    setShowOptimizerModal(true);
  };

  const handleApplyOptimizerPlan = (plan: OptimizedBasketPlan) => {
    // Si el usuario viene de la Lista de la Compra (sin receta previa), actualizamos los ítems existentes
    // asignándoles la tienda y el precio más barato SIN DUPLICARLOS
    if (!optimizerRecipeSource) {
      setShoppingList(prev =>
        prev.map(item => {
          // Buscar qué producto y tienda le asignó el plan para este ingrediente
          for (const store of plan.stores) {
            const matched = store.items.find(
              it => it.recipeIngredient.toLowerCase() === item.name.toLowerCase() ||
                    item.name.toLowerCase().includes(it.recipeIngredient.toLowerCase())
            );
            if (matched) {
              return {
                ...item,
                estimatedPrice: matched.subtotal,
                assignedSupermarket: store.supermarketName,
                assignedProductName: matched.productName,
              };
            }
          }
          return item;
        })
      );
    } else {
      // Si viene de una receta ("Para cocinar tortilla"), añadimos solo los que falten o fusionamos
      setShoppingList(prev => {
        const updated = [...prev];
        for (const store of plan.stores) {
          for (const it of store.items) {
            const existingIdx = updated.findIndex(
              s => s.name.toLowerCase() === it.recipeIngredient.toLowerCase()
            );
            if (existingIdx !== -1) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                estimatedPrice: it.subtotal,
                assignedSupermarket: store.supermarketName,
                assignedProductName: it.productName,
              };
            } else {
              updated.push({
                id: 'shop_rec_' + Date.now() + Math.random().toString(36).substring(2, 6),
                name: it.recipeIngredient,
                category: guessCategory(it.productName),
                quantity: it.neededQuantity,
                unit: it.unit,
                estimatedPrice: it.subtotal,
                checked: false,
                assignedSupermarket: store.supermarketName,
                assignedProductName: it.productName,
              });
            }
          }
        }
        return updated;
      });
    }

    setShowOptimizerModal(false);
    setActiveTab('compra');
    confetti({ particleCount: 70, spread: 70 });
  };

  // Stats
  const totalPantryValue = pantry.reduce((sum, item) => sum + (item.price || 0), 0);
  const expiringSoonCount = pantry.filter(item => {
    const d = getDaysRemaining(item.expiryDate);
    return d !== null && d <= 3;
  }).length;
  const pendingTicketCount = ticketSession?.items.filter(i => i.status === 'pending').length;
  const pendingProposalsCount = adminProposals.filter(p => p.status === 'pending').length;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-xl">
      {/* Top Header */}
      <Header
        pantryCount={pantry.length}
        totalPantryValue={totalPantryValue}
        expiringSoonCount={expiringSoonCount}
        onOpenRecipes={() => setActiveTab('recetas')}
        pendingProposalsCount={pendingProposalsCount}
        onOpenAdminPanel={isAdmin ? () => setShowAdminModal(true) : undefined}
        currentUser={currentUser}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {activeTab === 'frigo' && (
          <PantryTab
            pantry={pantry}
            filter={pantryFilter}
            onFilterChange={setPantryFilter}
            onAddItem={handleAddPantryItem}
            onUpdateQuantity={updatePantryQuantity}
            onRemoveItem={removePantryItem}
            onEditItem={setEditingPantryItem}
          />
        )}

        {activeTab === 'compra' && (
          <ShoppingTab
            shoppingList={shoppingList}
            onAddItem={handleAddShoppingItem}
            quickShoppingName={quickShoppingName}
            setQuickShoppingName={setQuickShoppingName}
            quickShoppingPrice={quickShoppingPrice}
            setQuickShoppingPrice={setQuickShoppingPrice}
            onToggleItem={toggleShoppingItem}
            onRemoveItem={removeShoppingItem}
            onTransferCheckedToPantry={handleTransferCheckedToPantry}
            onOpenOptimizer={handleOpenOptimizerForShoppingList}
          />
        )}

        {activeTab === 'ticket' && (
          <TicketReviewTab
            ticketSession={ticketSession}
            selectedSupermarket={selectedSupermarket}
            onSelectSupermarket={setSelectedSupermarket}
            isProcessingFile={isProcessingFile}
            onFileInputChange={handleFileInputChange}
            onLoadDemoTicket={handleLoadDemoTicket}
            onToggleVerified={toggleItemVerified}
            onUpdateReviewItem={updateTicketReviewItem}
            onDiscardItem={discardTicketReviewItem}
            onOpenAddModal={() => setShowAddTicketItemModal(true)}
            onDiscardSession={handleDiscardTicketSession}
            onFinalizeTicket={handleFinalizeTicket}
          />
        )}

        {activeTab === 'recetas' && (
          <RecipesTab
            recipes={recipes}
            pantry={pantry}
            recipeFilter={recipeFilter}
            onFilterChange={setRecipeFilter}
            recipeServingsMap={recipeServingsMap}
            onChangeServings={changeRecipeServings}
            onCookRecipe={handleCookRecipe}
            onRemoveRecipe={removeRecipe}
            onOpenCreateModal={() => setShowRecipeModal(true)}
            onOptimizeIngredients={handleOpenOptimizerForRecipe}
            evaluateRecipe={evaluateRecipe}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shoppingListCount={shoppingList.length}
        hasActiveTicketSession={ticketSession !== null}
        ticketPendingCount={pendingTicketCount}
        expiringSoonCount={expiringSoonCount}
      />

      {/* Modals */}
      {editingPantryItem && (
        <EditPantryModal
          item={editingPantryItem}
          onClose={() => setEditingPantryItem(null)}
          onSave={handleSavePantryItem}
        />
      )}

      {showAddTicketItemModal && (
        <AddTicketItemModal
          onClose={() => setShowAddTicketItemModal(false)}
          onAdd={handleAddManualItemToTicket}
        />
      )}

      {showRecipeModal && (
        <RecipeModal
          onClose={() => setShowRecipeModal(false)}
          onSave={handleSaveRecipe}
        />
      )}

      {/* Supermarket Prompt Modal (when supermarket could not be autodetected) */}
      {pendingTicketData && (
        <SupermarketPromptModal
          detectedName={pendingTicketData.detectedName}
          onConfirm={handleConfirmSupermarketPrompt}
          onCancel={() => setPendingTicketData(null)}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanelModal
          proposals={adminProposals}
          onApprove={handleApproveProposal}
          onReject={handleRejectProposal}
          onMergeWithExisting={handleMergeProposal}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* Shopping Optimizer Modal */}
      {showOptimizerModal && (
        <ShoppingOptimizerModal
          neededIngredients={optimizerIngredients}
          recipeSource={optimizerRecipeSource}
          onApplyPlanToShoppingList={handleApplyOptimizerPlan}
          onClose={() => setShowOptimizerModal(false)}
        />
      )}

      {/* Auth Modal (Login / Registro con contraseña) */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem(STORAGE_KEY_USER_ID, user.id);
            localStorage.setItem(STORAGE_KEY_USER_EMAIL, user.email);
            confetti({ particleCount: 50, spread: 60 });
          }}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem(STORAGE_KEY_USER_EMAIL);
            localStorage.removeItem(STORAGE_KEY_USER_ID);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
