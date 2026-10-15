export type Category = 'fruta-verdura' | 'carne-pescado' | 'lacteos' | 'despensa' | 'bebidas' | 'congelados' | 'otros';

export interface PantryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string; // 'uds', 'g', 'kg', 'ml', 'L', 'paquete'
  addedAt: string;
  expiresInDays?: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTimeMinutes: number;
  difficulty: 'fácil' | 'medio' | 'difícil';
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: string[];
}
