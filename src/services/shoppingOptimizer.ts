import type { Category, SupermarketProductOffer, OptimizedBasketPlan } from '../types';
import { SUPERMARKET_CATALOGS } from '../supermarkets';
import { REAL_SPANISH_PRODUCTS } from './realProductsDataset';

/**
 * Normaliza cadenas para comparaciones flexibles (elimina tildes, signos y minúsculas)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Calcula de forma coherente cuántas unidades de compra se necesitan para una cantidad dada.
 * Evita el fallo de multiplicar gramos por precio unitario (ej: 150g * 0.85€ = 127.50€).
 */
export function calculateRequiredPacks(
  neededQty: number,
  neededUnit: string,
  packUnit: string
): number {
  if (neededQty <= 0) return 1;

  // Si la receta pide gramos (ej: 150g de tomate o 200g de pollo)
  if (neededUnit === 'g') {
    if (packUnit === 'kg') {
      return Number(Math.max(1, Math.ceil(neededQty / 1000)).toFixed(0));
    }
    // Si viene en unidades (un bote/brick de tomate suele ser de ~350g-400g, un paquete de pasta 500g)
    const standardPackGrams = 400;
    return Math.max(1, Math.ceil(neededQty / standardPackGrams));
  }

  // Si la receta pide ml
  if (neededUnit === 'ml') {
    return Math.max(1, Math.ceil(neededQty / 1000));
  }

  // Si pide unidades, raciones o tuppers
  return Math.max(1, Math.ceil(neededQty));
}

/**
 * Encuentra todas las ofertas reales de un ingrediente en cada supermercado
 */
export function findProductOffersAcrossStores(
  ingredientName: string,
  approvedCommunityProducts: { name: string; supermarket: string; price?: number; unit: string }[] = []
): SupermarketProductOffer[] {
  const normQuery = normalizeString(ingredientName);
  const words = normQuery.split(/\s+/).filter(w => w.length > 2);
  const offersByStore: Record<string, SupermarketProductOffer> = {};

  // 1. Buscar en productos aprobados por el administrador (comunitarios)
  for (const custom of approvedCommunityProducts) {
    const storeKey = custom.supermarket.toLowerCase();
    if (normalizeString(custom.name).includes(normQuery)) {
      if (!offersByStore[storeKey] || (custom.price && custom.price < offersByStore[storeKey].price)) {
        offersByStore[storeKey] = {
          supermarketId: storeKey,
          supermarketName: custom.supermarket,
          productName: custom.name,
          price: custom.price || 1.80,
          unit: custom.unit || 'uds',
        };
      }
    }
  }

  // 2. Buscar en el catálogo verificado de productos reales
  for (const prod of REAL_SPANISH_PRODUCTS) {
    const normProd = normalizeString(prod.name);
    const normPatterns = normalizeString(prod.patterns);

    const matches =
      normProd.includes(normQuery) ||
      normQuery.includes(normProd) ||
      words.some(w => normPatterns.includes(w) || normProd.includes(w));

    if (matches) {
      const storeKey = prod.supermarketId.toLowerCase();
      if (!offersByStore[storeKey] || prod.price < offersByStore[storeKey].price) {
        offersByStore[storeKey] = {
          supermarketId: storeKey,
          supermarketName: prod.supermarketName,
          productName: `${prod.name} (${prod.brand})`,
          price: prod.price,
          unit: prod.unit,
        };
      }
    }
  }

  // 3. Fallback en catálogos de supermercado
  for (const [storeId, catalog] of Object.entries(SUPERMARKET_CATALOGS)) {
    if (offersByStore[storeId]) continue;

    for (const [pattern, prod] of Object.entries(catalog.patterns)) {
      const normNorm = normalizeString(prod.normalizedName);

      if (
        normNorm.includes(normQuery) ||
        normQuery.includes(normNorm) ||
        new RegExp(pattern, 'i').test(ingredientName)
      ) {
        offersByStore[storeId] = {
          supermarketId: storeId,
          supermarketName: catalog.name,
          productName: prod.normalizedName,
          price: prod.defaultPrice || 1.99,
          unit: prod.unit,
        };
        break;
      }
    }
  }

  // 4. Fallback estándar si es un ingrediente totalmente nuevo
  const knownStores = [
    { id: 'mercadona', name: 'Mercadona', brand: 'Hacendado', priceFactor: 1.0 },
    { id: 'dia', name: 'Día', brand: 'Día', priceFactor: 0.95 },
    { id: 'carrefour', name: 'Carrefour', brand: 'Carrefour Classic', priceFactor: 1.05 },
    { id: 'lidl', name: 'Lidl', brand: 'Milbona / Combino', priceFactor: 0.94 },
    { id: 'aldi', name: 'Aldi', brand: 'Milsani / GutBio', priceFactor: 0.95 },
    { id: 'gadis', name: 'Gadis', brand: 'Gadis Selección', priceFactor: 1.02 },
  ];

  for (const store of knownStores) {
    if (!offersByStore[store.id]) {
      const baseEstimate = 1.45 * store.priceFactor;
      offersByStore[store.id] = {
        supermarketId: store.id,
        supermarketName: store.name,
        productName: `${ingredientName} (${store.brand})`,
        price: Number(baseEstimate.toFixed(2)),
        unit: 'uds',
      };
    }
  }

  return Object.values(offersByStore);
}

/**
 * Genera planes de compra optimizados para una lista de ingredientes necesarios
 */
export function generateOptimizedShoppingPlans(
  neededIngredients: { name: string; quantity: number; unit: string }[],
  approvedCommunityProducts: { name: string; supermarket: string; price?: number; unit: string }[] = []
): OptimizedBasketPlan[] {
  if (neededIngredients.length === 0) return [];

  const ingredientOfferMap = neededIngredients.map(ing => ({
    ingredient: ing,
    offers: findProductOffersAcrossStores(ing.name, approvedCommunityProducts),
  }));

  const plans: OptimizedBasketPlan[] = [];

  // =========================================================================
  // PLAN 1: Ahorro Máximo (Multitienda / Precios más baratos de verdad)
  // =========================================================================
  const cheapestPlanStores: Record<string, { supermarketId: string; supermarketName: string; items: any[]; storeTotal: number }> = {};
  let cheapestTotal = 0;

  for (const { ingredient, offers } of ingredientOfferMap) {
    const sorted = [...offers].sort((a, b) => a.price - b.price);
    const bestOffer = sorted[0];

    if (!cheapestPlanStores[bestOffer.supermarketId]) {
      cheapestPlanStores[bestOffer.supermarketId] = {
        supermarketId: bestOffer.supermarketId,
        supermarketName: bestOffer.supermarketName,
        items: [],
        storeTotal: 0,
      };
    }

    const packsNeeded = calculateRequiredPacks(ingredient.quantity, ingredient.unit, bestOffer.unit);
    const subtotal = Number((bestOffer.price * packsNeeded).toFixed(2));

    cheapestPlanStores[bestOffer.supermarketId].items.push({
      recipeIngredient: ingredient.name,
      productName: bestOffer.productName,
      neededQuantity: packsNeeded,
      unit: bestOffer.unit,
      unitPrice: bestOffer.price,
      subtotal,
    });
    cheapestPlanStores[bestOffer.supermarketId].storeTotal += subtotal;
    cheapestTotal += subtotal;
  }

  plans.push({
    id: 'plan_cheapest',
    title: '💰 Máximo Ahorro (Combinando supermercados)',
    description: 'El precio total más bajo dividiendo la compra entre los sitios más baratos.',
    totalCost: Number(cheapestTotal.toFixed(2)),
    totalStores: Object.keys(cheapestPlanStores).length,
    stores: Object.values(cheapestPlanStores),
  });

  // =========================================================================
  // PLANES MONOTIENDA: Comodidad (Todo en 1 solo supermercado SIN MEZCLAR)
  // =========================================================================
  const singleStoreCandidates = [
    { id: 'mercadona', name: 'Mercadona' },
    { id: 'dia', name: 'Día' },
    { id: 'carrefour', name: 'Carrefour' },
    { id: 'lidl', name: 'Lidl' },
    { id: 'aldi', name: 'Aldi' },
    { id: 'gadis', name: 'Gadis' },
  ];

  for (const targetStore of singleStoreCandidates) {
    let storeTotal = 0;
    const items: any[] = [];

    for (const { ingredient, offers } of ingredientOfferMap) {
      let storeOffer = offers.find(o => o.supermarketId.toLowerCase() === targetStore.id);

      if (!storeOffer) {
        storeOffer = {
          supermarketId: targetStore.id,
          supermarketName: targetStore.name,
          productName: `${ingredient.name} (${targetStore.name})`,
          price: 1.45,
          unit: 'uds',
        };
      }

      const packsNeeded = calculateRequiredPacks(ingredient.quantity, ingredient.unit, storeOffer.unit);
      const subtotal = Number((storeOffer.price * packsNeeded).toFixed(2));

      items.push({
        recipeIngredient: ingredient.name,
        productName: storeOffer.productName,
        neededQuantity: packsNeeded,
        unit: storeOffer.unit,
        unitPrice: storeOffer.price,
        subtotal,
      });
      storeTotal += subtotal;
    }

    plans.push({
      id: `plan_single_${targetStore.id}`,
      title: `⚡ Todo en ${targetStore.name} (1 sola parada)`,
      description: `Haz toda la compra cómodamente en ${targetStore.name} sin desplazarte entre tiendas.`,
      totalCost: Number(storeTotal.toFixed(2)),
      totalStores: 1,
      stores: [{
        supermarketId: targetStore.id,
        supermarketName: targetStore.name,
        items,
        storeTotal: Number(storeTotal.toFixed(2)),
      }],
    });
  }

  return plans.sort((a, b) => a.totalCost - b.totalCost);
}

/**
 * Algoritmo de detección de duplicados o sospechas de alimentos iguales
 */
export function detectDuplicateSuspicion(
  newFood: { name: string; supermarket: string; category?: Category; unit?: string; price?: number },
  existingCatalog: { id: string; name: string; supermarket: string; category?: Category; price?: number }[]
): { existingId: string; existingName: string; similarity: number; reason: string } | undefined {
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

  const normNewName = normalize(newFood.name);
  const normNewSuper = normalize(newFood.supermarket);

  for (const existing of existingCatalog) {
    const normExistName = normalize(existing.name);
    const normExistSuper = normalize(existing.supermarket);

    const sameStore = normNewSuper === normExistSuper || normNewSuper.includes(normExistSuper) || normExistSuper.includes(normNewSuper);

    let similarity = 0;
    if (normNewName === normExistName) {
      similarity = 1.0;
    } else if (normNewName.includes(normExistName) || normExistName.includes(normNewName)) {
      similarity = 0.85;
    } else {
      const wordsA = new Set(newFood.name.toLowerCase().split(/\s+/));
      const wordsB = new Set(existing.name.toLowerCase().split(/\s+/));
      const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
      const union = new Set([...wordsA, ...wordsB]);
      similarity = union.size > 0 ? intersection.size / union.size : 0;
    }

    // Comprobar también variación de precio en el mismo producto
    const priceDifference = (newFood.price && existing.price) 
      ? Math.abs(newFood.price - existing.price) 
      : 0;

    if (similarity >= 0.70 && sameStore) {
      const priceMsg = priceDifference > 0.05 
        ? ` El precio ha cambiado de ${existing.price?.toFixed(2)}€ a ${newFood.price?.toFixed(2)}€.`
        : '';

      return {
        existingId: existing.id,
        existingName: existing.name,
        similarity: Math.round(similarity * 100),
        reason: `Mismo supermercado (${existing.supermarket}) y producto idéntico (${Math.round(similarity * 100)}% de coincidencia).${priceMsg}`,
      };
    } else if (similarity >= 0.90) {
      return {
        existingId: existing.id,
        existingName: `${existing.name} (${existing.supermarket})`,
        similarity: Math.round(similarity * 100),
        reason: `Mismo producto con nombre coincidente en ${existing.supermarket}.`,
      };
    }
  }

  return undefined;
}
