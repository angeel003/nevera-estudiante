import React, { useState } from 'react';
import { Plus, Minus, Trash2, Edit2, Snowflake, UtensilsCrossed, Clock, Activity, ChevronDown, ChevronUp, Refrigerator } from 'lucide-react';
import type { PantryItem, Category } from '../types';
import { CATEGORIES, getDaysRemaining, getOffsetDate } from '../utils/constants';
import { guessCategory, guessUnit, getDefaultExpiryDate } from '../mockData';

interface PantryTabProps {
  pantry: PantryItem[];
  filter: Category | 'todos';
  onFilterChange: (cat: Category | 'todos') => void;
  onAddItem: (item: PantryItem) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onEditItem: (item: PantryItem) => void;
}

export const PantryTab: React.FC<PantryTabProps> = ({
  pantry,
  filter,
  onFilterChange,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('uds');
  const [category, setCategory] = useState<Category>('otros');
  const [price, setPrice] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isFrozen, setIsFrozen] = useState(false);
  const [isPrepared, setIsPrepared] = useState(false);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = price ? parseFloat(price.replace(',', '.')) : undefined;
    const parsedKg = pricePerKg ? parseFloat(pricePerKg.replace(',', '.')) : undefined;
    let cat = category === 'otros' ? guessCategory(name) : category;
    if (isPrepared && cat === 'otros') cat = 'comida-preparada';
    if (isFrozen && cat === 'otros') cat = 'congelados';

    const expiryDate = expiry || (isFrozen ? getOffsetDate(90) : getDefaultExpiryDate(name));

    const cals = calories ? parseFloat(calories) : undefined;
    const prot = protein ? parseFloat(protein) : undefined;
    const crb = carbs ? parseFloat(carbs) : undefined;
    const ft = fat ? parseFloat(fat) : undefined;

    const hasNutrition = cals !== undefined || prot !== undefined || crb !== undefined || ft !== undefined;

    const newItem: PantryItem = {
      id: 'pantry_' + Date.now(),
      name: name.trim(),
      category: cat,
      quantity: Number(qty) || 1,
      unit: unit || guessUnit(name),
      price: isNaN(parsedPrice || 0) ? undefined : parsedPrice,
      pricePerKg: isNaN(parsedKg || 0) ? undefined : parsedKg,
      expiryDate,
      isFrozen: isFrozen || cat === 'congelados',
      isPreparedMeal: isPrepared || cat === 'comida-preparada',
      servings: isPrepared ? Number(qty) || 1 : undefined,
      notes: notes.trim() || undefined,
      nutrition: hasNutrition ? { calories: cals, protein: prot, carbs: crb, fat: ft } : undefined,
      addedAt: new Date().toISOString(),
    };

    onAddItem(newItem);

    setName('');
    setQty(1);
    setUnit('uds');
    setPrice('');
    setPricePerKg('');
    setExpiry('');
    setIsFrozen(false);
    setIsPrepared(false);
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
    setShowAdvanced(false);
  };

  const filteredPantry = pantry
    .filter(item => filter === 'todos' || item.category === filter)
    .sort((a, b) => {
      const daysA = getDaysRemaining(a.expiryDate) ?? 999;
      const daysB = getDaysRemaining(b.expiryDate) ?? 999;
      return daysA - daysB;
    });

  return (
    <div className="space-y-4">
      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200 space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Añadir al frigorífico o congelador
          </label>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1 transition"
          >
            <Activity className="w-3 h-3" />
            {showAdvanced ? 'Menos opciones' : '+ Nutrición y Tuppers'}
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Producto o plato (ej: Pollo al curry, Tupper lentejas...)"
            value={name}
            onChange={e => {
              const val = e.target.value;
              setName(val);
              if (val.length > 2) {
                const lower = val.toLowerCase();
                if (lower.match(/tupper|preparad|guiso|sobra|sopa|lasaña|lentejas cocinadas/)) {
                  setCategory('comida-preparada');
                  setIsPrepared(true);
                } else if (lower.match(/congelad|helado/)) {
                  setCategory('congelados');
                  setIsFrozen(true);
                } else {
                  setCategory(guessCategory(val));
                }
                setUnit(guessUnit(val));
              }
            }}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
            className="w-14 bg-slate-50 border border-slate-300 rounded-xl px-1 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Cantidad"
          />
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            className="w-20 bg-slate-50 border border-slate-300 rounded-xl px-1.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="uds">uds</option>
            <option value="tupper">tupper</option>
            <option value="raciones">raciones</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="L">L</option>
            <option value="paquete">paq.</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-0.5 text-xs">
          <select
            value={category}
            onChange={e => {
              const newCat = e.target.value as Category;
              setCategory(newCat);
              if (newCat === 'congelados') setIsFrozen(true);
              if (newCat === 'comida-preparada') setIsPrepared(true);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="comida-preparada">🍱 Tupper / Preparada</option>
            <option value="congelados">🧊 Congelados</option>
            <option value="carne-pescado">🥩 Carne/Pescado</option>
            <option value="fruta-verdura">🍎 Fruta/Verdura</option>
            <option value="lacteos">🧀 Lácteos</option>
            <option value="despensa">🥫 Despensa</option>
            <option value="bebidas">🧃 Bebidas</option>
            <option value="otros">🍽️ Otros</option>
          </select>

          <div className="relative">
            <span className="absolute left-2.5 top-2 text-slate-400">€</span>
            <input
              type="text"
              placeholder="Precio pack"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Precio del paquete o total (€)"
            />
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="€/kg (opc)"
              value={pricePerKg}
              onChange={e => setPricePerKg(e.target.value)}
              className="w-20 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-[11px] text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Precio por kilo o litro (€/kg)"
            />
            <input
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-1.5 py-1.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Fecha de caducidad"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl flex items-center justify-center font-medium transition active:scale-95 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsFrozen(!isFrozen)}
            className={`text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium transition ${
              isFrozen
                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>{isFrozen ? '❄️ En Congelador' : '¿Está congelado?'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !isPrepared;
              setIsPrepared(next);
              if (next) {
                setCategory('comida-preparada');
                if (unit === 'uds') setUnit('tupper');
              }
            }}
            className={`text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-medium transition ${
              isPrepared
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{isPrepared ? '🍱 Comida lista / Tupper' : '¿Comida ya hecha?'}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="pt-2 border-t border-slate-100 space-y-2 bg-slate-50/70 p-2.5 rounded-xl">
            <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Valores nutricionales (por ración o total):
            </p>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Calorías</span>
                <input
                  type="number"
                  placeholder="kcal"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Proteínas</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="g"
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Carbos</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="g"
                  value={carbs}
                  onChange={e => setCarbs(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Grasas</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="g"
                  value={fat}
                  onChange={e => setFat(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">Notas / observaciones</span>
              <input
                type="text"
                placeholder="Ej: Descongelar la noche de antes, lleva salsa de soja..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onFilterChange(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filter === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Pantry List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-semibold text-slate-700">
            {filter === 'todos' ? 'Todos los alimentos' : `Alimentos (${filter})`} ({filteredPantry.length})
          </h2>
          <span className="text-xs text-slate-500">Ordenados por caducidad</span>
        </div>

        {filteredPantry.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
            <Refrigerator className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">No hay productos en esta categoría</p>
            <p className="text-xs text-slate-400 mt-1">Prueba a seleccionar otra categoría o añadir un producto.</p>
          </div>
        ) : (
          filteredPantry.map(item => {
            const daysLeft = getDaysRemaining(item.expiryDate);
            const isExpired = daysLeft !== null && daysLeft < 0;
            const isUrgent = daysLeft !== null && daysLeft <= 2 && !isExpired;
            const isWarning = daysLeft !== null && daysLeft > 2 && daysLeft <= 5;

            return (
              <div
                key={item.id}
                className={`bg-white p-3.5 rounded-2xl border transition shadow-xs flex items-center justify-between ${
                  isExpired
                    ? 'border-red-300 bg-red-50/30'
                    : isUrgent
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200/80 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.category === 'comida-preparada' ? '🍱' :
                     item.isFrozen || item.category === 'congelados' ? '🧊' :
                     item.category === 'fruta-verdura' ? '🍎' :
                     item.category === 'carne-pescado' ? '🥩' :
                     item.category === 'lacteos' ? '🧀' :
                     item.category === 'despensa' ? '🥫' :
                     item.category === 'bebidas' ? '🧃' : '🍽️'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                      {item.isFrozen && (
                        <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <Snowflake className="w-2.5 h-2.5" /> Congelado
                        </span>
                      )}
                      {item.isPreparedMeal && (
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <UtensilsCrossed className="w-2.5 h-2.5" /> Tupper / Plato
                        </span>
                      )}
                      {item.price && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {item.price.toFixed(2)}€
                        </span>
                      )}
                      {item.pricePerKg && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.pricePerKg.toFixed(2)}€/kg
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-slate-500 font-medium">
                        {item.quantity} {item.unit}
                      </p>

                      {daysLeft !== null && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isExpired
                              ? 'bg-red-100 text-red-700'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800'
                              : isWarning
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {isExpired
                            ? `Caducó hace ${Math.abs(daysLeft)}d`
                            : daysLeft === 0
                            ? 'Caduca hoy'
                            : daysLeft === 1
                            ? 'Caduca mañana'
                            : `Caduca en ${daysLeft} días`}
                        </span>
                      )}

                      {item.nutrition && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5 text-emerald-600" />
                          {item.nutrition.calories ? `${item.nutrition.calories} kcal` : ''}
                          {item.nutrition.protein ? ` • ${item.nutrition.protein}g P` : ''}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    title="Gastar 1"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 flex items-center justify-center font-bold text-xs active:scale-95 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    title="Sumar 1"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 flex items-center justify-center font-bold text-xs active:scale-95 transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onEditItem(item)}
                    title="Modificar alimento"
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center active:scale-95 transition ml-0.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    title="Eliminar"
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center active:scale-95 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

