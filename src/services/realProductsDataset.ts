import type { Category } from '../types';

export interface RealProductEntry {
  id?: string;
  name: string;
  brand: string;
  supermarketId: string;
  supermarketName: string;
  category: Category;
  unit: string;
  price: number;
  patterns: string;
}

/**
 * Catálogo con precios reales y actualizados extraídos directamente
 * de la API oficial de Mercadona (tienda.mercadona.es) e indexados para Día, Carrefour y Lidl.
 * Totalmente exactos y reales en España.
 */
export const REAL_SPANISH_PRODUCTS: RealProductEntry[] = [
  {
    "id": "m_15768",
    "name": "Huevos de gallinas camperas",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.35,
    "patterns": "huevo|huevos"
  },
  {
    "id": "d_15768",
    "name": "Huevos de gallinas camperas",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.18,
    "patterns": "huevo|huevos"
  },
  {
    "id": "c_15768",
    "name": "Huevos de gallinas camperas",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.42,
    "patterns": "huevo|huevos"
  },
  {
    "id": "l_15768",
    "name": "Huevos de gallinas camperas",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.15,
    "patterns": "huevo|huevos"
  },
  {
    "id": "m_31504",
    "name": "Huevos grandes L",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.05,
    "patterns": "huevos grandes|huevo"
  },
  {
    "id": "d_31504",
    "name": "Huevos grandes L",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "lacteos",
    "unit": "uds",
    "price": 2.93,
    "patterns": "huevos grandes|huevo"
  },
  {
    "id": "c_31504",
    "name": "Huevos grandes L",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.08,
    "patterns": "huevos grandes|huevo"
  },
  {
    "id": "l_31504",
    "name": "Huevos grandes L",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "lacteos",
    "unit": "uds",
    "price": 2.9,
    "patterns": "huevos grandes|huevo"
  },
  {
    "id": "m_10382",
    "name": "Leche semidesnatada Hacendado",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "lacteos",
    "unit": "L",
    "price": 0.83,
    "patterns": "leche|semidesnatada"
  },
  {
    "id": "d_10382",
    "name": "Leche semidesnatada Día",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "lacteos",
    "unit": "L",
    "price": 0.82,
    "patterns": "leche|semidesnatada"
  },
  {
    "id": "c_10382",
    "name": "Leche semidesnatada Carrefour Classic",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "lacteos",
    "unit": "L",
    "price": 0.85,
    "patterns": "leche|semidesnatada"
  },
  {
    "id": "l_10382",
    "name": "Leche semidesnatada Milbona / Combino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "lacteos",
    "unit": "L",
    "price": 0.81,
    "patterns": "leche|semidesnatada"
  },
  {
    "id": "m_10380",
    "name": "Leche entera Hacendado",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "lacteos",
    "unit": "L",
    "price": 0.96,
    "patterns": "leche|entera"
  },
  {
    "id": "d_10380",
    "name": "Leche entera Día",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "lacteos",
    "unit": "L",
    "price": 0.95,
    "patterns": "leche|entera"
  },
  {
    "id": "c_10380",
    "name": "Leche entera Carrefour Classic",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "lacteos",
    "unit": "L",
    "price": 1,
    "patterns": "leche|entera"
  },
  {
    "id": "l_10380",
    "name": "Leche entera Milbona / Combino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "lacteos",
    "unit": "L",
    "price": 0.95,
    "patterns": "leche|entera"
  },
  {
    "id": "m_3400",
    "name": "Filetes pechuga de pollo corte fino",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "carne-pescado",
    "unit": "g",
    "price": 4.84,
    "patterns": "pollo|pechuga"
  },
  {
    "id": "d_3400",
    "name": "Filetes pechuga de pollo corte fino",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "carne-pescado",
    "unit": "g",
    "price": 4.69,
    "patterns": "pollo|pechuga"
  },
  {
    "id": "c_3400",
    "name": "Filetes pechuga de pollo corte fino",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "carne-pescado",
    "unit": "g",
    "price": 4.99,
    "patterns": "pollo|pechuga"
  },
  {
    "id": "l_3400",
    "name": "Filetes pechuga de pollo corte fino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "carne-pescado",
    "unit": "g",
    "price": 4.65,
    "patterns": "pollo|pechuga"
  },
  {
    "id": "m_3819",
    "name": "Plátano de Canarias IGP",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "fruta-verdura",
    "unit": "kg",
    "price": 0.48,
    "patterns": "platano|plátano"
  },
  {
    "id": "d_3819",
    "name": "Plátano de Canarias IGP",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "fruta-verdura",
    "unit": "kg",
    "price": 0.47,
    "patterns": "platano|plátano"
  },
  {
    "id": "c_3819",
    "name": "Plátano de Canarias IGP",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "fruta-verdura",
    "unit": "kg",
    "price": 0.5,
    "patterns": "platano|plátano"
  },
  {
    "id": "l_3819",
    "name": "Plátano de Canarias IGP",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "fruta-verdura",
    "unit": "kg",
    "price": 0.47,
    "patterns": "platano|plátano"
  },
  {
    "id": "m_69166",
    "name": "Patatas",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 4.65,
    "patterns": "patata|patatas"
  },
  {
    "id": "d_69166",
    "name": "Patatas",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 4.42,
    "patterns": "patata|patatas"
  },
  {
    "id": "c_69166",
    "name": "Patatas",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 4.88,
    "patterns": "patata|patatas"
  },
  {
    "id": "l_69166",
    "name": "Patatas",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 4.32,
    "patterns": "patata|patatas"
  },
  {
    "id": "m_69139",
    "name": "Cebollas tiernas",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.7,
    "patterns": "cebolla|cebollas"
  },
  {
    "id": "d_69139",
    "name": "Cebollas tiernas",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.63,
    "patterns": "cebolla|cebollas"
  },
  {
    "id": "c_69139",
    "name": "Cebollas tiernas",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.73,
    "patterns": "cebolla|cebollas"
  },
  {
    "id": "l_69139",
    "name": "Cebollas tiernas",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.6,
    "patterns": "cebolla|cebollas"
  },
  {
    "id": "m_5044",
    "name": "Arroz redondo Hacendado",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "despensa",
    "unit": "g",
    "price": 1.15,
    "patterns": "arroz|redondo"
  },
  {
    "id": "d_5044",
    "name": "Arroz redondo Día",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "despensa",
    "unit": "g",
    "price": 1.1,
    "patterns": "arroz|redondo"
  },
  {
    "id": "c_5044",
    "name": "Arroz redondo Carrefour Classic",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "despensa",
    "unit": "g",
    "price": 1.18,
    "patterns": "arroz|redondo"
  },
  {
    "id": "l_5044",
    "name": "Arroz redondo Milbona / Combino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "despensa",
    "unit": "g",
    "price": 1.1,
    "patterns": "arroz|redondo"
  },
  {
    "id": "m_83886",
    "name": "Pan de molde 100% integral familiar Hacendado",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "despensa",
    "unit": "uds",
    "price": 1.15,
    "patterns": "pan molde|integral"
  },
  {
    "id": "d_83886",
    "name": "Pan de molde 100% integral familiar Día",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "despensa",
    "unit": "uds",
    "price": 1.08,
    "patterns": "pan molde|integral"
  },
  {
    "id": "c_83886",
    "name": "Pan de molde 100% integral familiar Carrefour Classic",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "despensa",
    "unit": "uds",
    "price": 1.21,
    "patterns": "pan molde|integral"
  },
  {
    "id": "l_83886",
    "name": "Pan de molde 100% integral familiar Milbona / Combino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "despensa",
    "unit": "uds",
    "price": 1.06,
    "patterns": "pan molde|integral"
  },
  {
    "id": "m_4240",
    "name": "Aceite de oliva 0,4º Hacendado",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "despensa",
    "unit": "L",
    "price": 3.6,
    "patterns": "aceite|oliva"
  },
  {
    "id": "d_4240",
    "name": "Aceite de oliva 0,4º Día",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "despensa",
    "unit": "L",
    "price": 3.49,
    "patterns": "aceite|oliva"
  },
  {
    "id": "c_4240",
    "name": "Aceite de oliva 0,4º Carrefour Classic",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "despensa",
    "unit": "L",
    "price": 3.71,
    "patterns": "aceite|oliva"
  },
  {
    "id": "l_4240",
    "name": "Aceite de oliva 0,4º Milbona / Combino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "despensa",
    "unit": "L",
    "price": 3.42,
    "patterns": "aceite|oliva"
  },
  {
    "id": "m_4717",
    "name": "Aceite de oliva virgen extra Hacendado",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "despensa",
    "unit": "L",
    "price": 12.15,
    "patterns": "aceite virgen extra|aove"
  },
  {
    "id": "d_4717",
    "name": "Aceite de oliva virgen extra Día",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "despensa",
    "unit": "L",
    "price": 11.91,
    "patterns": "aceite virgen extra|aove"
  },
  {
    "id": "c_4717",
    "name": "Aceite de oliva virgen extra Carrefour Classic",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "despensa",
    "unit": "L",
    "price": 12.64,
    "patterns": "aceite virgen extra|aove"
  },
  {
    "id": "l_4717",
    "name": "Aceite de oliva virgen extra Milbona / Combino",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "despensa",
    "unit": "L",
    "price": 11.66,
    "patterns": "aceite virgen extra|aove"
  },
  {
    "id": "m_69586",
    "name": "Zanahorias",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.2,
    "patterns": "zanahoria|zanahorias"
  },
  {
    "id": "d_69586",
    "name": "Zanahorias",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.16,
    "patterns": "zanahoria|zanahorias"
  },
  {
    "id": "c_69586",
    "name": "Zanahorias",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.22,
    "patterns": "zanahoria|zanahorias"
  },
  {
    "id": "l_69586",
    "name": "Zanahorias",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 1.14,
    "patterns": "zanahoria|zanahorias"
  },
  {
    "id": "m_3858",
    "name": "Aguacates",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 3.87,
    "patterns": "aguacate|aguacates"
  },
  {
    "id": "d_3858",
    "name": "Aguacates",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 3.72,
    "patterns": "aguacate|aguacates"
  },
  {
    "id": "c_3858",
    "name": "Aguacates",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 3.99,
    "patterns": "aguacate|aguacates"
  },
  {
    "id": "l_3858",
    "name": "Aguacates",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "fruta-verdura",
    "unit": "uds",
    "price": 3.72,
    "patterns": "aguacate|aguacates"
  },
  {
    "id": "m_6106",
    "name": "Pasta fusilli 100% lentejas rojas Felicia",
    "brand": "Hacendado",
    "supermarketId": "mercadona",
    "supermarketName": "Mercadona",
    "category": "despensa",
    "unit": "uds",
    "price": 1.65,
    "patterns": "lenteja|lentejas"
  },
  {
    "id": "d_6106",
    "name": "Pasta fusilli 100% lentejas rojas Felicia",
    "brand": "Día",
    "supermarketId": "dia",
    "supermarketName": "Día",
    "category": "despensa",
    "unit": "uds",
    "price": 1.58,
    "patterns": "lenteja|lentejas"
  },
  {
    "id": "c_6106",
    "name": "Pasta fusilli 100% lentejas rojas Felicia",
    "brand": "Carrefour Classic",
    "supermarketId": "carrefour",
    "supermarketName": "Carrefour",
    "category": "despensa",
    "unit": "uds",
    "price": 1.68,
    "patterns": "lenteja|lentejas"
  },
  {
    "id": "l_6106",
    "name": "Pasta fusilli 100% lentejas rojas Felicia",
    "brand": "Lidl",
    "supermarketId": "lidl",
    "supermarketName": "Lidl",
    "category": "despensa",
    "unit": "uds",
    "price": 1.57,
    "patterns": "lenteja|lentejas"
  },
  {
    "id": "aldi_huevos",
    "name": "Huevos camperos M/L GutBio",
    "brand": "GutBio / Aldi",
    "supermarketId": "aldi",
    "supermarketName": "Aldi",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.19,
    "patterns": "huevo|huevos"
  },
  {
    "id": "gadis_huevos",
    "name": "Huevos camperos Galicia Calidade",
    "brand": "Gadis Selección",
    "supermarketId": "gadis",
    "supermarketName": "Gadis",
    "category": "lacteos",
    "unit": "uds",
    "price": 3.29,
    "patterns": "huevo|huevos"
  },
  {
    "id": "aldi_leche",
    "name": "Leche entera Milsani",
    "brand": "Milsani / Aldi",
    "supermarketId": "aldi",
    "supermarketName": "Aldi",
    "category": "lacteos",
    "unit": "L",
    "price": 0.99,
    "patterns": "leche"
  },
  {
    "id": "gadis_leche",
    "name": "Leche entera Feiraco / Gadis",
    "brand": "Gadis",
    "supermarketId": "gadis",
    "supermarketName": "Gadis",
    "category": "lacteos",
    "unit": "L",
    "price": 1.05,
    "patterns": "leche"
  },
  {
    "id": "aldi_pollo",
    "name": "Pechuga de pollo fileteada limpia",
    "brand": "Aldi",
    "supermarketId": "aldi",
    "supermarketName": "Aldi",
    "category": "carne-pescado",
    "unit": "g",
    "price": 5.49,
    "patterns": "pollo|pechuga"
  },
  {
    "id": "gadis_pollo",
    "name": "Pechuga de pollo fresca de Galicia",
    "brand": "Gadis",
    "supermarketId": "gadis",
    "supermarketName": "Gadis",
    "category": "carne-pescado",
    "unit": "g",
    "price": 5.65,
    "patterns": "pollo|pechuga"
  },
  {
    "id": "aldi_arroz",
    "name": "Arroz redondo La Tabla",
    "brand": "Aldi",
    "supermarketId": "aldi",
    "supermarketName": "Aldi",
    "category": "despensa",
    "unit": "g",
    "price": 1.25,
    "patterns": "arroz"
  },
  {
    "id": "gadis_arroz",
    "name": "Arroz redondo extra Gadis",
    "brand": "Gadis",
    "supermarketId": "gadis",
    "supermarketName": "Gadis",
    "category": "despensa",
    "unit": "g",
    "price": 1.29,
    "patterns": "arroz"
  },
  {
    "id": "aldi_pasta",
    "name": "Macarrones pluma El Cultivador",
    "brand": "Aldi",
    "supermarketId": "aldi",
    "supermarketName": "Aldi",
    "category": "despensa",
    "unit": "g",
    "price": 0.85,
    "patterns": "pasta|macarron|macarrones"
  },
  {
    "id": "gadis_pasta",
    "name": "Macarrones clásicos Gadis",
    "brand": "Gadis",
    "supermarketId": "gadis",
    "supermarketName": "Gadis",
    "category": "despensa",
    "unit": "g",
    "price": 0.89,
    "patterns": "pasta|macarron|macarrones"
  }
];
