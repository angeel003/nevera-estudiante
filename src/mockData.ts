import type { Category, Recipe } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Tortilla de Patatas Clásica',
    description: 'El clásico infalible de estudiante: nutritivo, barato y delicioso.',
    cookingTimeMinutes: 25,
    difficulty: 'fácil',
    ingredients: [
      { name: 'Huevos', quantity: 4, unit: 'uds' },
      { name: 'Patatas', quantity: 3, unit: 'uds' },
      { name: 'Cebolla', quantity: 1, unit: 'uds' },
      { name: 'Aceite de oliva', quantity: 50, unit: 'ml' },
    ],
    steps: [
      'Pelar y cortar las patatas y la cebolla en láminas finas.',
      'Pochar a fuego medio en abundante aceite hasta que estén tiernas.',
      'Batir los 4 huevos con sal en un bol grande.',
      'Mezclar las patatas escurridas con el huevo y dejar reposar 3 minutos.',
      'Cuajar en la sartén 2 minutos por cada lado.'
    ]
  },
  {
    id: 'r2',
    title: 'Pasta al Huevo con Tomate y Atún',
    description: 'La comida rápida por excelencia cuando hay prisa entre clases.',
    cookingTimeMinutes: 15,
    difficulty: 'fácil',
    ingredients: [
      { name: 'Pasta (Macarrones o Espaguetis)', quantity: 150, unit: 'g' },
      { name: 'Tomate frito', quantity: 150, unit: 'g' },
      { name: 'Atún en lata', quantity: 2, unit: 'uds' },
      { name: 'Queso rallado', quantity: 30, unit: 'g' },
    ],
    steps: [
      'Cocer la pasta en agua hirviendo con sal durante 8-10 minutos.',
      'En una sartén calentar el tomate frito con el atún desmenuzado.',
      'Escurrir la pasta, mezclar con la salsa y espolvorear queso por encima.'
    ]
  },
  {
    id: 'r3',
    title: 'Arroz Salteado con Pollo y Verduras',
    description: 'Perfecto para aprovechar restos de verduras y pechuga.',
    cookingTimeMinutes: 20,
    difficulty: 'fácil',
    ingredients: [
      { name: 'Arroz', quantity: 120, unit: 'g' },
      { name: 'Pechuga de pollo', quantity: 200, unit: 'g' },
      { name: 'Zanahoria', quantity: 1, unit: 'uds' },
      { name: 'Pimiento', quantity: 1, unit: 'uds' },
      { name: 'Salsa de soja', quantity: 20, unit: 'ml' },
    ],
    steps: [
      'Cocer el arroz blanco o usar vasitos de microondas.',
      'Cortar el pollo y las verduras en tiras o dados.',
      'Saltear en sartén caliente el pollo hasta dorar, añadir verduras 4 minutos.',
      'Añadir el arroz y la soja, saltear todo junto a fuego vivo.'
    ]
  },
  {
    id: 'r4',
    title: 'Tostada de Aguacate y Huevo Poché / Frito',
    description: 'Desayuno o cena ligera, saludable y lista en 5 minutos.',
    cookingTimeMinutes: 8,
    difficulty: 'fácil',
    ingredients: [
      { name: 'Pan de molde / rebanada', quantity: 2, unit: 'uds' },
      { name: 'Aguacate', quantity: 1, unit: 'uds' },
      { name: 'Huevos', quantity: 2, unit: 'uds' },
      { name: 'Aceite de oliva', quantity: 10, unit: 'ml' },
    ],
    steps: [
      'Tostar las rebanadas de pan.',
      'Aplastar el aguacate con un tenedor, sal y un toque de aceite.',
      'Cocinar los huevos a la plancha o fritos con la yema jugosa.',
      'Montar el aguacate sobre la tostada y coronar con el huevo.'
    ]
  }
];

export function guessCategory(name: string): Category {
  const n = name.toLowerCase();
  if (n.match(/manzana|platano|plátano|naranja|limon|limón|tomate|lechuga|cebolla|patata|zanahoria|ajo|pimiento|aguacate|fresa|fruta|verdura/)) {
    return 'fruta-verdura';
  }
  if (n.match(/pollo|ternera|cerdo|pescado|merluza|salmon|salmón|atun|atún|lata|jamon|jamón|pavo|carne|lomo|hamburguesa|pechuga/)) {
    return 'carne-pescado';
  }
  if (n.match(/leche|queso|yogur|yogurt|mantequilla|nata|huevo|huevos/)) {
    return 'lacteos';
  }
  if (n.match(/pasta|arroz|pan|harina|aceite|sal|azucar|azúcar|galleta|cereal|legumbre|garbanzo|lenteja/)) {
    return 'despensa';
  }
  if (n.match(/agua|zumo|coca|cerveza|refresco|vino|cafe|café|te|té/)) {
    return 'bebidas';
  }
  if (n.match(/helado|pizza|congelad/)) {
    return 'congelados';
  }
  return 'otros';
}

export function guessUnit(name: string): string {
  const n = name.toLowerCase();
  if (n.match(/leche|agua|aceite|zumo|vino|caldo/)) return 'L';
  if (n.match(/arroz|pasta|harina|legumbre|lenteja|garbanzo|azucar/)) return 'g';
  if (n.match(/pollo|carne|pescado|ternera/)) return 'g';
  return 'uds';
}

// Estimar días habituales de caducidad según el producto
export function guessExpiryDays(name: string): number {
  const n = name.toLowerCase();
  if (n.match(/pescado|merluza|salmon|salmón/)) return 2; // Pescado fresco: 2 días
  if (n.match(/carne|pollo|pechuga|ternera|cerdo|picada/)) return 3; // Carnes frescas: 3 días
  if (n.match(/lechuga|fresa|aguacate|tomate/)) return 5; // Verdura/fruta delicada: 4-5 días
  if (n.match(/leche|yogur|yogurt|queso fresco/)) return 7; // Lácteos frescos: 7 días
  if (n.match(/fruta|platano|plátano|manzana|naranja|limon/)) return 10;
  if (n.match(/huevo|huevos/)) return 18; // Huevos: ~2-3 semanas
  if (n.match(/queso curado|mantequilla/)) return 25;
  if (n.match(/arroz|pasta|lata|atun|atún|legumbre|harina|aceite/)) return 180; // Despensa / conservas: 6 meses
  return 14; // Por defecto 2 semanas
}

export function getDefaultExpiryDate(name: string): string {
  const days = guessExpiryDays(name);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

