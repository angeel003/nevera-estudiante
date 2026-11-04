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
 * Encuentra todas las ofertas reales de un ingrediente en cada supermercado
 */
export function findProductOffersAcrossStores(
  ingredientName: string,
  userCustomItems: { name: string; supermarket: string; price?: number; unit: string }[] = []
): SupermarketProductOffer[] {
  const normQuery = normalizeString(ingredientName);
  const words = normQuery.split(/\s+/).filter(w => w.length > 2);
  const offersByStore: Record<string, SupermarketProductOffer> = {};

  // 1. Buscar primero en la base de datos de productos reales (Mercadona, Día, Carrefour, Lidl)
  for (const prod of REAL_SPANISH_PRODUCTS) {
    const normProd = normalizeString(prod.name);
    const normPatterns = normalizeString(prod.patterns);

    const matches =
      normProd.includes(normQuery) ||
      normQuery.includes(normProd) ||
      words.some(w => normPatterns.includes(w) || normProd.includes(w));

    if (matches) {
      const storeKey = prod.supermarketId.toLowerCase();
      // Guardar el mejor precio encontrado para ese supermercado
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

  // 2. Buscar en catálogos de patrones de supermercados
  for (const [storeId, catalog] of Object.entries(SUPERMARKET_CATALOGS)) {
    if (offersByStore[storeId]) continue; // Ya tiene producto real encontrado

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

  // 3. Buscar en alimentos añadidos por usuarios (privados / comunidad)
  for (const custom of userCustomItems) {
    const storeKey = custom.supermarket.toLowerCase();
    if (normalizeString(custom.name).includes(normQuery)) {
      if (!offersByStore[storeKey]) {
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

  // Fallback si ningún supermercado lo tiene: generar opción propia coherente por cada súper
  const knownStores = [
    { id: 'mercadona', name: 'Mercadona', brand: 'Hacendado', priceFactor: 1.0 },
    { id: 'dia', name: 'Día', brand: 'Día', priceFactor: 0.95 },
    { id: 'carrefour', name: 'Carrefour', brand: 'Carrefour Classic', priceFactor: 1.05 },
    { id: 'lidl', name: 'Lidl', brand: 'Milbona / Combino', priceFactor: 0.94 },
  ];

  for (const store of knownStores) {
    if (!offersByStore[store.id]) {
      const baseEstimate = 1.65 * store.priceFactor;
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
  userCustomItems: { name: string; supermarket: string; price?: number; unit: string }[] = []
): OptimizedBasketPlan[] {
  if (neededIngredients.length === 0) return [];

  // Mapear cada ingrediente con sus ofertas
  const ingredientOfferMap = neededIngredients.map(ing => ({
    ingredient: ing,
    offers: findProductOffersAcrossStores(ing.name, userCustomItems),
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

    const subtotal = Number((bestOffer.price * Math.max(1, Math.ceil(ingredient.quantity / (bestOffer.unit === 'g' ? 250 : 1)))).toFixed(2));
    cheapestPlanStores[bestOffer.supermarketId].items.push({
      recipeIngredient: ingredient.name,
      productName: bestOffer.productName,
      neededQuantity: ingredient.quantity,
      unit: ingredient.unit,
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
  ];

  for (const targetStore of singleStoreCandidates) {
    let storeTotal = 0;
    const items: any[] = [];

    for (const { ingredient, offers } of ingredientOfferMap) {
      // OBLIGATORIO: Tomar la oferta que pertenezca estrictamente a este supermercado
      let storeOffer = offers.find(o => o.supermarketId.toLowerCase() === targetStore.id);

      // Si no existe, crear el producto específico de este supermercado sin mezclar con Carrefour ni otros
      if (!storeOffer) {
        storeOffer = {
          supermarketId: targetStore.id,
          supermarketName: targetStore.name,
          productName: `${ingredient.name} (${targetStore.name})`,
          price: 1.85,
          unit: ingredient.unit || 'uds',
        };
      }

      const subtotal = Number((storeOffer.price * Math.max(1, Math.ceil(ingredient.quantity / (storeOffer.unit === 'g' ? 250 : 1)))).toFixed(2));
      items.push({
        recipeIngredient: ingredient.name,
        productName: storeOffer.productName,
        neededQuantity: ingredient.quantity,
        unit: ingredient.unit,
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

  // Ordenar: primero el plan más económico
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

    if (similarity >= 0.70 && sameStore) {
      return {
        existingId: existing.id,
        existingName: existing.name,
        similarity: Math.round(similarity * 100),
        reason: `Mismo supermercado (${existing.supermarket}) y nombre prácticamente idéntico (${Math.round(similarity * 100)}% de coincidencia).`,
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
