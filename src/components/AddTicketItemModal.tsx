import React from 'react';
import { Plus, X } from 'lucide-react';
import type { Category } from '../types';
import { guessCategory, guessUnit } from '../mockData';

interface AddTicketItemModalProps {
  onClose: () => void;
  onAdd: (item: {
    name: string;
    quantity: number;
    unit: string;
    price?: number;
    category: Category;
  }) => void;
}

export const AddTicketItemModal: React.FC<AddTicketItemModalProps> = ({
  onClose,
  onAdd,
}) => {
  const [name, setName] = React.useState('');
  const [qty, setQty] = React.useState(1);
  const [unit, setUnit] = React.useState('uds');
  const [category, setCategory] = React.useState<Category>('otros');
  const [price, setPrice] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPrice = price ? parseFloat(price.replace(',', '.')) : undefined;
    onAdd({
      name: name.trim(),
      quantity: Number(qty) || 1,
      unit: unit || guessUnit(name),
      price: isNaN(parsedPrice || 0) ? undefined : parsedPrice,
      category: category === 'otros' ? guessCategory(name) : category,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" /> Añadir alimento que faltó
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Nombre del producto</label>
            <input
              type="text"
              placeholder="Ej: Queso gouda, Plátanos..."
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.length > 2) {
                  setCategory(guessCategory(e.target.value));
                  setUnit(guessUnit(e.target.value));
                }
              }}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-center text-sm"
              />
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Unidad</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                <option value="uds">uds</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="tupper">tupper</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Precio (€)</label>
              <input
                type="text"
                placeholder="1.50"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-center text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-semibold block mb-1">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
            >
              <option value="carne-pescado">🥩 Carne/Pescado</option>
              <option value="fruta-verdura">🍎 Fruta/Verdura</option>
              <option value="lacteos">🧀 Lácteos</option>
              <option value="despensa">🥫 Despensa</option>
              <option value="congelados">🧊 Congelados</option>
              <option value="comida-preparada">🍱 Preparada</option>
              <option value="bebidas">🧃 Bebidas</option>
              <option value="otros">🍽️ Otros</option>
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition shadow-xs"
            >
              Añadir al ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

