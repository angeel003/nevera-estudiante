import type { PantryItem } from './types';
import { guessCategory, guessUnit } from './mockData';

export interface ParsedTicketItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
}

export function parseReceiptText(text: string): ParsedTicketItem[] {
  const lines = text.split('\n');
  const items: ParsedTicketItem[] = [];

  // Supermarket patterns:
  // e.g., "1 HUEVOS CAMPEROS 12U 2.45"
  // "2 LECHE ENTERA 1L 1.90"
  // "PLATANO DE CANARIAS 1.85"
  // "PECHUGA POLLO 4.20"
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) continue;

    // Ignore receipt headers/footers
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('total') ||
      lower.includes('subtotal') ||
      lower.includes('iva') ||
      lower.includes('tarjeta') ||
      lower.includes('mercadona') ||
      lower.includes('carrefour') ||
      lower.includes('lidl') ||
      lower.includes('cif') ||
      lower.includes('factura') ||
      lower.includes('fecha') ||
      lower.includes('gracias por su visita')
    ) {
      continue;
    }

    // Extract price if at the end (e.g. 1.85 o 1,85 €)
    const priceMatch = trimmed.match(/(\d+[.,]\d{2})\s*€?$/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : undefined;

    // Remove the price from line
    let cleaned = priceMatch ? trimmed.slice(0, priceMatch.index).trim() : trimmed;

    // Check if starts with a number quantity (e.g. "2 LECHE ENTERA")
    const qtyMatch = cleaned.match(/^(\d+)\s*(?:x|ud|uds)?\s+(.*)/i);
    let qty = 1;
    let name = cleaned;

    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
      name = qtyMatch[2];
    }

    // Capitalize first letter of each word nicely
    name = name
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();

    if (name.length > 2) {
      items.push({
        name,
        quantity: qty,
        unit: guessUnit(name),
        price,
      });
    }
  }

  return items;
}

// Convert parsed item to PantryItem
export function convertToPantryItem(item: ParsedTicketItem): PantryItem {
  return {
    id: 'item_' + Math.random().toString(36).substring(2, 9),
    name: item.name,
    category: guessCategory(item.name),
    quantity: item.quantity,
    unit: item.unit,
    addedAt: new Date().toISOString(),
  };
}
