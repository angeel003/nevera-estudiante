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
  OptimizedBasketPlan,
  HouseholdInfo,
  UserAccount
} from './types';
import {
  STORAGE_KEY_PANTRY,
  STORAGE_KEY_SHOPPING,
  STORAGE_KEY_RECIPES,
  STORAGE_KEY_TICKET_DRAFT,
  STORAGE_KEY_ADMIN_PROPOSALS,
  STORAGE_KEY_USER_ID,
  STORAGE_KEY_USER_EMAIL,
  STORAGE_KEY_AUTH_USER,
  STORAGE_KEY_REMEMBER_ME,
  STORAGE_KEY_HOUSEHOLD,
  ADMIN_EMAILS,
  getDaysRemaining
} from './utils/constants';
import { guessCategory, guessUnit, getDefaultExpiryDate } from './mockData';
import { parseReceiptText } from './receiptParser';
import { extractTextFromPdf } from './pdfParser';
import { detectSupermarketFromText, SUPERMARKET_CATALOGS } from './supermarkets';
import { detectDuplicateSuspicion } from './services/shoppingOptimizer';
import { recognizeReceiptText } from './services/ocrService';

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
import { ShareFridgeModal } from './components/ShareFridgeModal';

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
  const [showShareFridgeModal, setShowShareFridgeModal] = useState(false);
  const [isViewerMode, setIsViewerMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('viewer') === 'true';
    }
    return false;
  });
  const [optimizerIngredients, setOptimizerIngredients] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [optimizerRecipeSource, setOptimizerRecipeSource] = useState<Recipe | undefined>(undefined);

  // User account & session state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // 1. Si marcó "Mantener sesión iniciada", leer credenciales recordadas de localStorage
    const isRemembered = localStorage.getItem(STORAGE_KEY_REMEMBER_ME) === 'true';
    if (isRemembered) {
      const savedUserStr = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          if (user && user.id) return user;
        } catch (e) {}
      }
      const savedEmail = localStorage.getItem(STORAGE_KEY_USER_EMAIL);
      const savedId = localStorage.getItem(STORAGE_KEY_USER_ID);
      if (savedEmail && savedId) {
        return {
          id: savedId,
          email: savedEmail,
          name: savedEmail.split('@')[0],
          isAdmin: ADMIN_EMAILS.includes(savedEmail.toLowerCase().trim()),
        };
      }
    }

    // 2. Si es una pestaña activa sin recordar permanentemente, leer de sessionStorage
    const sessionUserStr = sessionStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (sessionUserStr) {
      try {
        const user = JSON.parse(sessionUserStr);
        if (user && user.id) return user;
      } catch (e) {}
    }
    const sessionEmail = sessionStorage.getItem(STORAGE_KEY_USER_EMAIL);
    const sessionUserId = sessionStorage.getItem(STORAGE_KEY_USER_ID);
    if (sessionEmail && sessionUserId) {
      return {
        id: sessionUserId,
        email: sessionEmail,
        name: sessionEmail.split('@')[0],
        isAdmin: ADMIN_EMAILS.includes(sessionEmail.toLowerCase().trim()),
      };
    }

    // 3. No hay sesión iniciada: se solicita login obligatorio al entrar
    return null;
  });

  const userId = currentUser?.id || 'usr_guest';
  const isAdmin = currentUser?.isAdmin || false;

  // Frigo Compartido & Hogar (Piso de estudiantes / Pareja)
  const [household, setHousehold] = useState<HouseholdInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HOUSEHOLD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }
    const randomCode = 'FRIGO-' + Math.floor(1000 + Math.random() * 9000);
    return {
      id: 'house_' + Date.now(),
      name: 'Mi Frigorífico',
      inviteCode: randomCode,
      members: [
        {
          id: userId,
          name: currentUser?.name || 'Yo',
          email: currentUser?.email || 'angelhv2003@gmail.com',
          joinedAt: new Date().toISOString(),
          isOwner: true,
        },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HOUSEHOLD, JSON.stringify(household));
  }, [household]);

  const handleJoinHousehold = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code || !code.startsWith('FRIGO-')) {
      return { success: false, message: 'El código debe tener el formato FRIGO-XXXX' };
    }
    const myMember = {
      id: userId,
      name: currentUser?.name || 'Compañero',
      email: currentUser?.email || 'companero@myfridge.local',
      joinedAt: new Date().toISOString(),
      isOwner: false,
    };

    const updated: HouseholdInfo = {
      id: 'house_' + code,
      name: 'Frigo Compartido (' + code + ')',
      inviteCode: code,
      members: [
        {
          id: 'user_host_' + code,
          name: 'Compañero de Piso',
          email: 'anfitrion@piso.es',
          joinedAt: new Date().toISOString(),
          isOwner: true,
        },
        myMember,
      ],
    };

    setHousehold(updated);
    return {
      success: true,
      message: `¡Te has conectado con éxito al frigo compartido con código ${code}! Ahora compartís los alimentos comunes de la nevera.`,
    };
  };

  const handleLeaveHousehold = () => {
    const newCode = 'FRIGO-' + Math.floor(1000 + Math.random() * 9000);
    setHousehold({
      id: 'house_' + Date.now(),
      name: 'Mi Frigorífico Individual',
      inviteCode: newCode,
      members: [
        {
          id: userId,
          name: currentUser?.name || 'Yo',
          email: currentUser?.email || 'angelhv2003@gmail.com',
          joinedAt: new Date().toISOString(),
          isOwner: true,
        },
      ],
    });
  };

  // Admin proposed food items list (with duplicate suspicion detector)
  const [adminProposals, setAdminProposals] = useState<ProposedFoodItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PROPOSALS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyDemo = Array.isArray(parsed) && parsed.some(item => item.id === 'prop_demo_1');
        if (isLegacyDemo) {
          localStorage.removeItem(STORAGE_KEY_ADMIN_PROPOSALS);
          return [];
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Dynamic servings multiplier state per recipe (e.g. { 'r1': 2, 'r2': 3 })
  const [recipeServingsMap, setRecipeServingsMap] = useState<Record<string, number>>({});

  // State: Pantry with localStorage persistence (starts completely clean)
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PANTRY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyDemo = Array.isArray(parsed) && parsed.length <= 6 && parsed.some(item => item.id === 'p1');
        if (isLegacyDemo) {
          localStorage.removeItem(STORAGE_KEY_PANTRY);
          return [];
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  // State: Shopping List with localStorage persistence (starts completely clean)
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHOPPING);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyDemo = Array.isArray(parsed) && parsed.length <= 3 && parsed.some(item => item.id === 's1');
        if (isLegacyDemo) {
          localStorage.removeItem(STORAGE_KEY_SHOPPING);
          return [];
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  // State: Custom Recipes (solo cargadas de la base de datos D1 o creadas por el usuario)
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECIPES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isLegacyDemo = Array.isArray(parsed) && parsed.some(item => item.id === 'r1' || item.id === 'r2');
        if (isLegacyDemo) {
          localStorage.removeItem(STORAGE_KEY_RECIPES);
          return [];
        }
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Cargar recetas reales de la base de datos Cloudflare D1
  useEffect(() => {
    const fetchDbRecipes = async () => {
      try {
        const res = await fetch(`/api/recipes?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.recipes)) {
            setRecipes(data.recipes);
            localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(data.recipes));
          }
        }
      } catch (err) {
        // En modo local o sin conexión se mantiene el estado
      }
    };
    fetchDbRecipes();
  }, [userId]);

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
  const [ocrStatusMessage, setOcrStatusMessage] = useState<string | null>(null);

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

  // Recipe actions (sincronizadas con Cloudflare D1)
  const removeRecipe = async (id: string) => {
    if (window.confirm('¿Quieres eliminar esta receta?')) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      try {
        await fetch(`/api/recipes?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        });
      } catch (e) { /* ignore */ }
    }
  };

  const handleSaveRecipe = async (newRecipe: Recipe) => {
    setRecipes([newRecipe, ...recipes]);
    setShowRecipeModal(false);
    confetti({ particleCount: 60, spread: 70 });
    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipe: newRecipe }),
      });
    } catch (e) { /* ignore */ }
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

  const appendTicketSessionItems = (rawText: string, supermarketId?: string) => {
    if (!ticketSession) return;
    const sm = supermarketId || ticketSession.supermarket;
    const parsed = parseReceiptText(rawText, sm);
    
    // Nombres existentes para evitar duplicar productos en caso de capturas solapadas
    const existingNames = new Set(ticketSession.items.map(i => i.name.toLowerCase()));
    
    const newReviewItems: TicketReviewItem[] = parsed
      .filter(item => !existingNames.has(item.name.toLowerCase()))
      .map((item, index) => ({
        id: 'rev_' + Date.now() + '_' + index,
        rawText: item.rawText || item.name,
        name: item.name,
        category: item.category || guessCategory(item.name),
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        expiryDate: getDefaultExpiryDate(item.name),
        isFrozen: false,
        status: 'pending' as const
      }));

    if (newReviewItems.length === 0) {
      alert('No se detectaron productos adicionales distintos o ya estaban todos en la lista.');
      return;
    }

    setTicketSession({
      ...ticketSession,
      items: [...ticketSession.items, ...newReviewItems]
    });
    confetti({ particleCount: 35, spread: 60 });
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

  const handleProcessTicketFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFile(true);
    try {
      let combinedText = '';
      let firstPreview: string | null = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const pdfText = await extractTextFromPdf(file);
          if (pdfText.trim()) {
            combinedText += (combinedText ? '\n' : '') + pdfText;
          }
        } else {
          const previewUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          if (!firstPreview) {
            firstPreview = previewUrl;
          }

          // Procesar con motor OCR real Tesseract.js
          try {
            setOcrStatusMessage(`Preparando foto ${i + 1} de ${files.length}...`);
            const ocrExtracted = await recognizeReceiptText(file, (p) => {
              setOcrStatusMessage(`[Foto ${i + 1}/${files.length}] ${p.status}`);
            });
            if (ocrExtracted && ocrExtracted.trim().length > 5) {
              combinedText += (combinedText ? '\n' : '') + ocrExtracted;
            }
          } catch (ocrErr) {
            console.error('Error al ejecutar OCR en archivo:', file.name, ocrErr);
          }
        }
      }

      if (ticketSession) {
        appendTicketSessionItems(combinedText, ticketSession.supermarket);
      } else if (combinedText.trim().length > 5) {
        handleTicketRawTextLoaded(combinedText, firstPreview);
      } else {
        handleLoadDemoTicket();
      }
    } catch (err) {
      console.error('Error processing ticket files:', err);
      alert('Hubo un problema al leer los archivos. Inténtalo de nuevo.');
    } finally {
      setIsProcessingFile(false);
      setOcrStatusMessage(null);
    }
  };

  const handleProcessTicketFile = async (file: File) => {
    await handleProcessTicketFiles([file]);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleProcessTicketFiles(Array.from(files));
      e.target.value = '';
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

  // Manejo de autenticación y persistencia de sesión
  const handleLoginSuccess = (user: UserAccount, rememberMe: boolean) => {
    setCurrentUser(user);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_REMEMBER_ME, 'true');
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_USER_ID, user.id);
      localStorage.setItem(STORAGE_KEY_USER_EMAIL, user.email);
    } else {
      localStorage.removeItem(STORAGE_KEY_REMEMBER_ME);
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_USER_ID);
      localStorage.removeItem(STORAGE_KEY_USER_EMAIL);
      sessionStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEY_USER_ID, user.id);
      sessionStorage.setItem(STORAGE_KEY_USER_EMAIL, user.email);
    }
    setShowAuthModal(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_USER_EMAIL);
    localStorage.removeItem(STORAGE_KEY_USER_ID);
    sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
    sessionStorage.removeItem(STORAGE_KEY_USER_EMAIL);
    sessionStorage.removeItem(STORAGE_KEY_USER_ID);
    setShowAuthModal(false);
  };

  // Pantalla de inicio de sesión obligatoria al entrar si no hay sesión
  if (!currentUser) {
    return (
      <AuthModal
        isInitialScreen={true}
        currentUser={null}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen bg-slate-50/70 flex flex-col shadow-2xl">
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
        onOpenShareFridge={() => setShowShareFridgeModal(true)}
        householdName={household.name}
        isViewerMode={isViewerMode}
        onExitViewerMode={() => setIsViewerMode(false)}
      />

      {/* Main Content View */}
      <main className="flex-1 p-3 sm:p-4 pb-28 sm:pb-32 overflow-y-auto">
        {activeTab === 'frigo' && (
          <PantryTab
            pantry={pantry}
            filter={pantryFilter}
            onFilterChange={setPantryFilter}
            onAddItem={handleAddPantryItem}
            onUpdateQuantity={updatePantryQuantity}
            onRemoveItem={removePantryItem}
            onEditItem={setEditingPantryItem}
            currentUserId={userId}
            householdName={household.name}
            householdMembersCount={household.members.length}
            onOpenShareFridge={() => setShowShareFridgeModal(true)}
            isViewerMode={isViewerMode}
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
            ocrStatusMessage={ocrStatusMessage}
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

      {/* Auth Modal (Modificar perfil o cerrar sesión desde dentro) */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Share Fridge Modal (Piso Compartido / Pareja / Vault / Vista Mamá) */}
      {showShareFridgeModal && (
        <ShareFridgeModal
          currentUser={currentUser}
          household={household}
          onUpdateHousehold={setHousehold}
          onJoinHousehold={handleJoinHousehold}
          onLeaveHousehold={handleLeaveHousehold}
          onClose={() => setShowShareFridgeModal(false)}
          onOpenAuth={() => setShowAuthModal(true)}
          isViewerMode={isViewerMode}
          onToggleViewerMode={setIsViewerMode}
        />
      )}
    </div>
  );
}
