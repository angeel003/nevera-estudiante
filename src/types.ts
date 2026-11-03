export type Category = 
  | 'fruta-verdura' 
  | 'carne-pescado' 
  | 'lacteos' 
  | 'despensa' 
  | 'bebidas' 
  | 'congelados' 
  | 'comida-preparada' 
  | 'otros';

export interface NutritionInfo {
  calories?: number;   // kcal
  protein?: number;    // gramos
  carbs?: number;      // gramos
  fat?: number;        // gramos
}

export interface PantryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string; // 'uds', 'g', 'kg', 'ml', 'L', 'tupper', 'porcion', 'paquete'
  price?: number; // Precio en euros
  addedAt: string; // ISO string
  expiryDate?: string; // YYYY-MM-DD
  isFrozen?: boolean; // si está guardado en el congelador
  isPreparedMeal?: boolean; // tupper, comida cocinada, sobras
  servings?: number; // raciones disponibles si es comida preparada
  notes?: string; // observaciones o notas de preparación
  nutrition?: NutritionInfo; // info nutricional opcional (kcal, proteínas, etc.)
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  checked: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number; // Número de raciones base (ej: 1 o 2 personas)
  cookingTimeMinutes: number;
  difficulty: 'fácil' | 'medio' | 'difícil';
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: string[];
}
