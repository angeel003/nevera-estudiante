export type Category = 'fruta-verdura' | 'carne-pescado' | 'lacteos' | 'despensa' | 'bebidas' | 'congelados' | 'otros';

export interface PantryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string; // 'uds', 'g', 'kg', 'ml', 'L', 'paquete'
  price?: number; // Precio en euros
  addedAt: string; // ISO string
  expiryDate?: string; // YYYY-MM-DD
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
