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

export type Supermarket = 'mercadona' | 'carrefour' | 'lidl' | 'dia' | 'alcampo' | 'eroski' | 'otro' | string;

export interface TicketReviewItem {
  id: string;
  rawText: string; // El texto crudo leído del ticket (ej: "HUEV.CAMP.L 12U 2.45")
  name: string; // Nombre normalizado que se guardará (ej: "Huevos Camperos")
  category: Category;
  quantity: number;
  unit: string;
  price?: number;
  expiryDate?: string;
  isFrozen?: boolean;
  status: 'pending' | 'verified' | 'discarded'; // estado de revisión
}

export interface TicketSession {
  id: string;
  supermarket: Supermarket;
  createdAt: string;
  imagePreview?: string | null;
  items: TicketReviewItem[];
}

export interface ProposedFoodItem {
  id: string;
  userId: string;
  userEmail?: string;
  name: string;
  supermarket: string;
  category: Category;
  unit: string;
  price?: number;
  rawText?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  duplicateSuspect?: {
    existingId: string;
    existingName: string;
    similarity: number;
    reason: string;
  };
}

export interface SupermarketProductOffer {
  supermarketId: string;
  supermarketName: string;
  productName: string;
  price: number;
  unit: string;
  availableAmount?: number;
}

export interface OptimizedBasketPlan {
  id: string;
  title: string;
  description: string;
  totalCost: number;
  totalStores: number;
  stores: {
    supermarketId: string;
    supermarketName: string;
    items: {
      recipeIngredient: string;
      productName: string;
      neededQuantity: number;
      unit: string;
      unitPrice: number;
      subtotal: number;
    }[];
    storeTotal: number;
  }[];
}
