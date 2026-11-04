import type { Category } from '../types';

export const STORAGE_KEY_PANTRY = 'estudiante_app_pantry';
export const STORAGE_KEY_SHOPPING = 'estudiante_app_shopping';
export const STORAGE_KEY_RECIPES = 'estudiante_app_recipes';
export const STORAGE_KEY_TICKET_DRAFT = 'estudiante_app_ticket_session';
export const STORAGE_KEY_ADMIN_PROPOSALS = 'myfridge_admin_proposals';
export const STORAGE_KEY_USER_ID = 'myfridge_current_user_id';
export const STORAGE_KEY_USER_EMAIL = 'myfridge_current_user_email';

// Lista de correos con permisos de Administrador para moderar alimentos
export const ADMIN_EMAILS = [
  'angelhv2003@gmail.com',
  'admin@myfridge.pages.dev'
];

export const CATEGORIES: { id: Category | 'todos'; label: string; emoji: string }[] = [
  { id: 'todos', label: 'Todos', emoji: '✨' },
  { id: 'comida-preparada', label: 'Tuppers / Preparada', emoji: '🍱' },
  { id: 'congelados', label: 'Congelador', emoji: '🧊' },
  { id: 'carne-pescado', label: 'Carne / Pescado', emoji: '🥩' },
  { id: 'fruta-verdura', label: 'Fruta / Verdura', emoji: '🍎' },
  { id: 'lacteos', label: 'Lácteos / Huevos', emoji: '🧀' },
  { id: 'despensa', label: 'Despensa / Pasta', emoji: '🥫' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🧃' },
];

export const getOffsetDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const getDaysRemaining = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
