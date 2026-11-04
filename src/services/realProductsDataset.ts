import type { Category } from '../types';

export interface RealProductEntry {
  barcode?: string;
  name: string;
  brand: string;
  supermarketId: string;
  supermarketName: string;
  category: Category;
  unit: string;
  price: number;
  patterns: string; // términos comunes o abreviaturas que salen en los tickets
}

/**
 * Catálogo real pre-cargado de productos habituales en supermercados españoles
 * (Mercadona, Día, Carrefour, Lidl) basado en datasets públicos de Open Food Facts España y precios reales.
 */
export const REAL_SPANISH_PRODUCTS: RealProductEntry[] = [
  // --- HUEVOS & LÁCTEOS ---
  {
    name: 'Huevos Clase L Camperos',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'lacteos',
    unit: 'uds',
    price: 2.45,
    patterns: 'huevo|huevos|camperos|clase l'
  },
  {
    name: 'Huevos Clase M/L Suelo',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'lacteos',
    unit: 'uds',
    price: 2.25,
    patterns: 'huevo|huevos|clase m'
  },
  {
    name: 'Huevos Frescos Carrefour Classic',
    brand: 'Carrefour',
    supermarketId: 'carrefour',
    supermarketName: 'Carrefour',
    category: 'lacteos',
    unit: 'uds',
    price: 2.35,
    patterns: 'huevo|huevos|carrefour classic'
  },
  {
    name: 'Huevos Frescos Suelo Milbona',
    brand: 'Milbona',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'lacteos',
    unit: 'uds',
    price: 2.29,
    patterns: 'huevo|huevos|milbona'
  },
  {
    name: 'Leche Semidesnatada 1L',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'lacteos',
    unit: 'L',
    price: 1.05,
    patterns: 'leche|semidesnatada|leche semi'
  },
  {
    name: 'Leche Entera 1L',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'lacteos',
    unit: 'L',
    price: 1.05,
    patterns: 'leche|entera'
  },
  {
    name: 'Leche Semidesnatada Día 1L',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'lacteos',
    unit: 'L',
    price: 0.99,
    patterns: 'leche|semidesnatada|leche dia'
  },
  {
    name: 'Leche Milbona Semidesnatada 1L',
    brand: 'Milbona',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'lacteos',
    unit: 'L',
    price: 0.99,
    patterns: 'leche|milbona semi'
  },
  {
    name: 'Leche Carrefour Clásica Semi 1L',
    brand: 'Carrefour',
    supermarketId: 'carrefour',
    supermarketName: 'Carrefour',
    category: 'lacteos',
    unit: 'L',
    price: 1.02,
    patterns: 'leche|carrefour semi'
  },
  {
    name: 'Queso Rallado Mozzarella 200g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'lacteos',
    unit: 'uds',
    price: 1.85,
    patterns: 'queso|rallado|mozzarella'
  },
  {
    name: 'Queso Rallado Pizza Día 200g',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'lacteos',
    unit: 'uds',
    price: 1.75,
    patterns: 'queso|rallado|pizza'
  },
  {
    name: 'Yogur Griego Natural Pack 4x125g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'lacteos',
    unit: 'uds',
    price: 1.70,
    patterns: 'yogur|griego|natural'
  },
  {
    name: 'Mantequilla con Sal 250g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'lacteos',
    unit: 'uds',
    price: 2.15,
    patterns: 'mantequilla'
  },

  // --- CARNES & PESCADOS ---
  {
    name: 'Pechuga de Pollo Fileteada Extra 500g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'carne-pescado',
    unit: 'g',
    price: 4.50,
    patterns: 'pollo|pechuga|filetes'
  },
  {
    name: 'Pechuga de Pollo Bandeja Selección 500g',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'carne-pescado',
    unit: 'g',
    price: 4.29,
    patterns: 'pollo|pechuga|bandeja'
  },
  {
    name: 'Filetes de Pechuga Limpia 500g',
    brand: 'Carrefour',
    supermarketId: 'carrefour',
    supermarketName: 'Carrefour',
    category: 'carne-pescado',
    unit: 'g',
    price: 4.40,
    patterns: 'pollo|pechuga|limpia'
  },
  {
    name: 'Pechuga de Pollo Familiar Lidl 500g',
    brand: 'Lidl',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'carne-pescado',
    unit: 'g',
    price: 4.25,
    patterns: 'pollo|pechuga|familiar'
  },
  {
    name: 'Atún Claro en Aceite de Girasol Pack 3',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'carne-pescado',
    unit: 'uds',
    price: 2.15,
    patterns: 'atun|atún|claro'
  },
  {
    name: 'Atún Claro en Aceite Vegetal Pack 3',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'carne-pescado',
    unit: 'uds',
    price: 2.10,
    patterns: 'atun|atún|pack 3'
  },
  {
    name: 'Atún Claro Nixe Aceite Pack 3',
    brand: 'Nixe',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'carne-pescado',
    unit: 'uds',
    price: 2.09,
    patterns: 'atun|nixe'
  },
  {
    name: 'Carne Picada Mixta Vacuno/Cerdo 500g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'carne-pescado',
    unit: 'g',
    price: 3.95,
    patterns: 'picada|mixta|vacuno|cerdo'
  },

  // --- FRUTAS & VERDURAS ---
  {
    name: 'Plátano de Canarias IGP',
    brand: 'Origen Canarias',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'fruta-verdura',
    unit: 'kg',
    price: 1.85,
    patterns: 'platano|plátano|canarias'
  },
  {
    name: 'Plátano Canario Día',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'fruta-verdura',
    unit: 'kg',
    price: 1.75,
    patterns: 'platano|plátano|canario'
  },
  {
    name: 'Plátano de Canarias Extra Carrefour',
    brand: 'Carrefour',
    supermarketId: 'carrefour',
    supermarketName: 'Carrefour',
    category: 'fruta-verdura',
    unit: 'kg',
    price: 1.89,
    patterns: 'platano|plátano|extra'
  },
  {
    name: 'Plátano de Canarias Lidl',
    brand: 'Lidl',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'fruta-verdura',
    unit: 'kg',
    price: 1.79,
    patterns: 'platano|plátano|lidl'
  },
  {
    name: 'Patatas Malla 3kg',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'fruta-verdura',
    unit: 'uds',
    price: 3.45,
    patterns: 'patata|patatas|malla'
  },
  {
    name: 'Cebolla Malla 2kg',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'fruta-verdura',
    unit: 'uds',
    price: 1.95,
    patterns: 'cebolla|cebollas'
  },
  {
    name: 'Aguacates Pack 2 uds',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'fruta-verdura',
    unit: 'uds',
    price: 2.10,
    patterns: 'aguacate|aguacates'
  },
  {
    name: 'Zanahorias Malla 1kg',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'fruta-verdura',
    unit: 'uds',
    price: 0.95,
    patterns: 'zanahoria|zanahorias'
  },

  // --- DESPENSA, PASTA & ARROZ ---
  {
    name: 'Pasta Macarrones 500g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'g',
    price: 0.90,
    patterns: 'macarron|macarrones|plumas'
  },
  {
    name: 'Pasta Macarrones Día 500g',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'despensa',
    unit: 'g',
    price: 0.88,
    patterns: 'macarrones|pasta dia'
  },
  {
    name: 'Pasta Combino Macarrones 500g',
    brand: 'Combino',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'despensa',
    unit: 'g',
    price: 0.85,
    patterns: 'combino|macarrones'
  },
  {
    name: 'Espaguetis 500g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'g',
    price: 0.90,
    patterns: 'espagueti|espaguetis'
  },
  {
    name: 'Tomate Frito Brick 390g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'uds',
    price: 0.85,
    patterns: 'tomate frito|brick'
  },
  {
    name: 'Tomate Frito Día 390g',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'despensa',
    unit: 'uds',
    price: 0.80,
    patterns: 'tomate frito|dia'
  },
  {
    name: 'Tomate Frito Campo Largo 390g',
    brand: 'Campo Largo',
    supermarketId: 'lidl',
    supermarketName: 'Lidl',
    category: 'despensa',
    unit: 'uds',
    price: 0.79,
    patterns: 'tomate frito|campo largo'
  },
  {
    name: 'Arroz Redondo Extra 1kg',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'g',
    price: 1.30,
    patterns: 'arroz|redondo'
  },
  {
    name: 'Pan de Molde 100% Integral Sin Corteza',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'uds',
    price: 1.45,
    patterns: 'pan molde|integral'
  },
  {
    name: 'Aceite de Oliva Virgen Extra 1L',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'L',
    price: 7.95,
    patterns: 'aceite|oliva|virgen extra|aove'
  },
  {
    name: 'Aceite de Oliva Suave 1L',
    brand: 'Día',
    supermarketId: 'dia',
    supermarketName: 'Día',
    category: 'despensa',
    unit: 'L',
    price: 6.90,
    patterns: 'aceite|suave'
  },
  {
    name: 'Garbanzos Cocidos Tarro 400g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'uds',
    price: 0.85,
    patterns: 'garbanzo|garbanzos|cocidos'
  },
  {
    name: 'Lentejas Cocidas Tarro 400g',
    brand: 'Hacendado',
    supermarketId: 'mercadona',
    supermarketName: 'Mercadona',
    category: 'despensa',
    unit: 'uds',
    price: 0.85,
    patterns: 'lenteja|lentejas'
  }
];
