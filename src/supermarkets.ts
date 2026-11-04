import type { Category } from './types';

export interface KnownProduct {
  normalizedName: string;
  category: Category;
  unit: string;
  defaultPrice?: number;
}

export interface SupermarketCatalog {
  id: string;
  name: string;
  aliases: string[]; // términos que suelen aparecer en la cabecera o CIF
  patterns: Record<string, KnownProduct>; // clave: regex o término clave abreviado
}

export const SUPERMARKET_CATALOGS: Record<string, SupermarketCatalog> = {
  mercadona: {
    id: 'mercadona',
    name: 'Mercadona',
    aliases: ['mercadona', 'hacendado', 'deliplus', 'bosque verde', 'cif a-46103834', 'a46103834'],
    patterns: {
      'huev|hacendado huevos': { normalizedName: 'Huevos Camperos', category: 'lacteos', unit: 'uds', defaultPrice: 2.45 },
      'leche enter|semides|desnat|leche hacendado': { normalizedName: 'Leche Hacendado', category: 'lacteos', unit: 'L', defaultPrice: 1.05 },
      'pechuga|pollo filete': { normalizedName: 'Pechuga de Pollo Fileteada', category: 'carne-pescado', unit: 'g', defaultPrice: 4.50 },
      'platano|banana': { normalizedName: 'Plátano de Canarias', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.80 },
      'tomate frito': { normalizedName: 'Tomate Frito Hacendado', category: 'despensa', unit: 'uds', defaultPrice: 0.85 },
      'macarron|pasta plumas|espagueti': { normalizedName: 'Pasta Macarrones Hacendado', category: 'despensa', unit: 'g', defaultPrice: 0.90 },
      'atun claro|atun aceite': { normalizedName: 'Atún Claro en Aceite', category: 'carne-pescado', unit: 'uds', defaultPrice: 2.15 },
      'queso rallado|mozzarella': { normalizedName: 'Queso Rallado Pizza-Pasta', category: 'lacteos', unit: 'uds', defaultPrice: 1.85 },
      'yogur natural|griego': { normalizedName: 'Yogur Griego Natural', category: 'lacteos', unit: 'uds', defaultPrice: 1.70 },
      'pan molde': { normalizedName: 'Pan de Molde 100% Integral', category: 'despensa', unit: 'uds', defaultPrice: 1.35 },
      'arroz redondo': { normalizedName: 'Arroz Redondo Hacendado', category: 'despensa', unit: 'g', defaultPrice: 1.25 },
      'hummus': { normalizedName: 'Hummus de Garbanzo Hacendado', category: 'despensa', unit: 'uds', defaultPrice: 1.40 },
    }
  },
  dia: {
    id: 'dia',
    name: 'Supermercados Día',
    aliases: ['dia', 'distribuidora internacional de alimentacion', 'dia %', 'club dia', 'a-28164754', 'a28164754'],
    patterns: {
      'huev|huevos dia': { normalizedName: 'Huevos Clase M/L Día', category: 'lacteos', unit: 'uds', defaultPrice: 2.30 },
      'leche entera|leche semidesnatada|leche desnatada': { normalizedName: 'Leche Día', category: 'lacteos', unit: 'L', defaultPrice: 0.99 },
      'pollo filetes|pechuga': { normalizedName: 'Pechuga de Pollo Selección Día', category: 'carne-pescado', unit: 'g', defaultPrice: 4.35 },
      'platano canarias': { normalizedName: 'Plátano de Canarias Día', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.75 },
      'tomate frito dia': { normalizedName: 'Tomate Frito Receta Artesana Día', category: 'despensa', unit: 'uds', defaultPrice: 0.80 },
      'macarrones|espirales dia': { normalizedName: 'Macarrones Día', category: 'despensa', unit: 'g', defaultPrice: 0.88 },
      'atun dia|atun claro': { normalizedName: 'Atún Claro Día Pack 3', category: 'carne-pescado', unit: 'uds', defaultPrice: 2.20 },
      'pan molde dia': { normalizedName: 'Pan de Molde Día', category: 'despensa', unit: 'uds', defaultPrice: 1.15 },
    }
  },
  carrefour: {
    id: 'carrefour',
    name: 'Carrefour',
    aliases: ['carrefour', 'centros comerciales carrefour', 'pass carrefour', 'a-28425270', 'a28425270', 'carrefour express'],
    patterns: {
      'huev|huevos carrefour': { normalizedName: 'Huevos Carrefour Classic', category: 'lacteos', unit: 'uds', defaultPrice: 2.35 },
      'leche carrefour|semides': { normalizedName: 'Leche Carrefour', category: 'lacteos', unit: 'L', defaultPrice: 1.02 },
      'pechuga pollo': { normalizedName: 'Filetes de Pechuga Carrefour', category: 'carne-pescado', unit: 'g', defaultPrice: 4.40 },
      'platano': { normalizedName: 'Plátano de Canarias Extra', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.89 },
      'tomate frito carrefour': { normalizedName: 'Tomate Frito Carrefour Classic', category: 'despensa', unit: 'uds', defaultPrice: 0.82 },
      'pasta|macarron carrefour': { normalizedName: 'Macarrones Carrefour', category: 'despensa', unit: 'g', defaultPrice: 0.89 },
      'atun carrefour': { normalizedName: 'Atún Claro Carrefour', category: 'carne-pescado', unit: 'uds', defaultPrice: 2.10 },
    }
  },
  lidl: {
    id: 'lidl',
    name: 'Lidl',
    aliases: ['lidl', 'lidl plus', 'milbona', 'dulcesol', 'chef select', 'a-08538620'],
    patterns: {
      'huev|milbona huevos': { normalizedName: 'Huevos Frescos Milbona', category: 'lacteos', unit: 'uds', defaultPrice: 2.29 },
      'leche milbona|milbona leche': { normalizedName: 'Leche Milbona Lidl', category: 'lacteos', unit: 'L', defaultPrice: 0.99 },
      'pechuga pollo lidl': { normalizedName: 'Pechuga de Pollo Lidl', category: 'carne-pescado', unit: 'g', defaultPrice: 4.29 },
      'platano canarias lidl': { normalizedName: 'Plátano de Canarias Lidl', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.79 },
      'tomate frito lidl|campo largo': { normalizedName: 'Tomate Frito Campo Largo Lidl', category: 'despensa', unit: 'uds', defaultPrice: 0.79 },
      'combino pasta|macarrones': { normalizedName: 'Pasta Combino Macarrones', category: 'despensa', unit: 'g', defaultPrice: 0.85 },
      'nixe atun|atun en lata': { normalizedName: 'Atún Claro en Aceite Nixe', category: 'carne-pescado', unit: 'uds', defaultPrice: 2.09 },
      'queso milbona': { normalizedName: 'Queso Milbona Rallado', category: 'lacteos', unit: 'uds', defaultPrice: 1.69 },
    }
  },
  alcampo: {
    id: 'alcampo',
    name: 'Alcampo',
    aliases: ['alcampo', 'auchan', 'a-28581882'],
    patterns: {
      'huev|auchan huevos': { normalizedName: 'Huevos Auchan', category: 'lacteos', unit: 'uds', defaultPrice: 2.25 },
      'leche auchan': { normalizedName: 'Leche Entera Auchan', category: 'lacteos', unit: 'L', defaultPrice: 0.98 },
      'pechuga pollo': { normalizedName: 'Pechuga de Pollo Fileteada Alcampo', category: 'carne-pescado', unit: 'g', defaultPrice: 4.19 },
      'platano': { normalizedName: 'Plátano Canario Alcampo', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.75 },
    }
  },
  eroski: {
    id: 'eroski',
    name: 'Eroski',
    aliases: ['eroski', 'f-48077247', 'eroski basic'],
    patterns: {
      'huev|eroski huevos': { normalizedName: 'Huevos Eroski', category: 'lacteos', unit: 'uds', defaultPrice: 2.39 },
      'leche eroski': { normalizedName: 'Leche Eroski Basic', category: 'lacteos', unit: 'L', defaultPrice: 1.01 },
      'pechuga pollo eroski': { normalizedName: 'Pechuga de Pollo Eroski Natur', category: 'carne-pescado', unit: 'g', defaultPrice: 4.45 },
    }
  },
  gadis: {
    id: 'gadis',
    name: 'Gadis',
    aliases: ['gadis', 'gadisa', 'gadis hiper', 'gallega de distribucion alimentaria', 'a-15024479', 'a15024479'],
    patterns: {
      'huev|huevos gadis': { normalizedName: 'Huevos Selección Gadis', category: 'lacteos', unit: 'uds', defaultPrice: 2.35 },
      'leche gadis|leche entera|leche semidesnatada|larsa|feiraco': { normalizedName: 'Leche Gallega Gadis', category: 'lacteos', unit: 'L', defaultPrice: 1.02 },
      'pechuga pollo|pollo gadis': { normalizedName: 'Pechuga de Pollo Fresca Gadis', category: 'carne-pescado', unit: 'g', defaultPrice: 4.39 },
      'platano canarias': { normalizedName: 'Plátano de Canarias Gadis', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.85 },
      'tomate frito gadis': { normalizedName: 'Tomate Frito Casero Gadis', category: 'despensa', unit: 'uds', defaultPrice: 0.85 },
      'pasta|macarron gadis': { normalizedName: 'Macarrones Gadis', category: 'despensa', unit: 'g', defaultPrice: 0.89 },
      'atun claro gadis': { normalizedName: 'Atún Claro en Aceite Gadis', category: 'carne-pescado', unit: 'uds', defaultPrice: 2.15 },
    }
  },
  aldi: {
    id: 'aldi',
    name: 'Aldi',
    aliases: ['aldi', 'aldi central de compras', 'milsani', 'gut bio', 'el cultivador', 'la tabla', 'b-60721248', 'b60721248'],
    patterns: {
      'huev|huevos aldi|huevos gut bio': { normalizedName: 'Huevos Frescos Clase M/L Aldi', category: 'lacteos', unit: 'uds', defaultPrice: 2.29 },
      'leche milsani|milsani leche': { normalizedName: 'Leche Milsani Aldi', category: 'lacteos', unit: 'L', defaultPrice: 0.99 },
      'pechuga pollo aldi': { normalizedName: 'Pechuga de Pollo Fileteada Aldi', category: 'carne-pescado', unit: 'g', defaultPrice: 4.29 },
      'platano canarias aldi': { normalizedName: 'Plátano de Canarias Aldi', category: 'fruta-verdura', unit: 'kg', defaultPrice: 1.79 },
      'tomate frito aldi|el cultivador': { normalizedName: 'Tomate Frito El Cultivador Aldi', category: 'despensa', unit: 'uds', defaultPrice: 0.79 },
      'pasta combino|macarrones aldi|el cultivador': { normalizedName: 'Macarrones El Cultivador Aldi', category: 'despensa', unit: 'g', defaultPrice: 0.85 },
      'atun aldi|almare': { normalizedName: 'Atún Claro en Aceite Almare Aldi', category: 'carne-pescado', unit: 'uds', defaultPrice: 2.09 },
      'queso aldi|milsani': { normalizedName: 'Queso Rallado Milsani Aldi', category: 'lacteos', unit: 'uds', defaultPrice: 1.69 },
    }
  }
};

/**
 * Intenta autodetectar el supermercado a partir del texto del ticket
 */
export function detectSupermarketFromText(text: string): { supermarketId: string; name: string; confidence: 'high' | 'medium' | 'none' } {
  const lower = text.toLowerCase();

  for (const key of Object.keys(SUPERMARKET_CATALOGS)) {
    const catalog = SUPERMARKET_CATALOGS[key];
    for (const alias of catalog.aliases) {
      if (lower.includes(alias)) {
        return {
          supermarketId: catalog.id,
          name: catalog.name,
          confidence: 'high'
        };
      }
    }
  }

  return {
    supermarketId: 'otro',
    name: 'Otro / No detectado',
    confidence: 'none'
  };
}

/**
 * Busca si una línea o texto crudo coincide con alimentos específicos del catálogo de esa tienda
 */
export function matchProductInCatalog(rawLine: string, supermarketId?: string): KnownProduct | null {
  if (!supermarketId) return null;
  const catalog = SUPERMARKET_CATALOGS[supermarketId.toLowerCase()];
  if (!catalog) return null;

  const lower = rawLine.toLowerCase();

  for (const [pattern, product] of Object.entries(catalog.patterns)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lower)) {
      return product;
    }
  }

  return null;
}

